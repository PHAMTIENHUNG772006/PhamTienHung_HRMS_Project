package com.company.hrms.module.auth.controller;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.ChangePasswordRequest;
import com.company.hrms.model.dto.request.LoginRequest;
import com.company.hrms.model.dto.request.RegisterRequest;
import com.company.hrms.model.dto.request.TokenRefreshRequest;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.AuthResponse;
import com.company.hrms.model.dto.response.TokenRefreshResponse;
import com.company.hrms.model.entity.RefreshToken;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.auth.service.AuthService;
import com.company.hrms.security.jwt.JwtProvider;
import com.company.hrms.security.jwt.RefreshTokenService;
import com.company.hrms.security.jwt.TokenBlacklistService;
import com.company.hrms.security.ratelimit.RateLimiterService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtProvider jwtProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final RateLimiterService rateLimiterService;
    private final com.company.hrms.module.auth.repository.UserRepository userRepository;

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        // Rate limiting: Chống Brute-force (tối đa 5 lần gọi / 1 phút theo IP)
        String clientIp = getClientIp(httpRequest);
        if (!rateLimiterService.tryAcquire("login:" + clientIp, 5, Duration.ofMinutes(1))) {
            throw new AppException("Quá nhiều yêu cầu đăng nhập từ IP này. Vui lòng thử lại sau 1 phút.", HttpStatus.TOO_MANY_REQUESTS);
        }

        AuthResponse response = authService.login(request);

        // Lưu Refresh Token vào HttpOnly Cookie (chống XSS)
        if (response.getRefreshToken() != null) {
            ResponseCookie cookie = buildRefreshTokenCookie(response.getRefreshToken(), 7 * 24 * 60 * 60);
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Đăng nhập thành công")
                .data(response)
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Đăng ký thành công")
                .data(response)
                .build());
    }

    @PostMapping("/refresh-token")
    @Transactional
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(
            @RequestBody(required = false) TokenRefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String requestRefreshToken = null;
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            requestRefreshToken = request.getRefreshToken().trim();
        } else if (httpRequest.getCookies() != null) {
            for (Cookie c : httpRequest.getCookies()) {
                if (REFRESH_COOKIE_NAME.equals(c.getName())) {
                    requestRefreshToken = c.getValue();
                    break;
                }
            }
        }

        if (requestRefreshToken == null || requestRefreshToken.isBlank()) {
            throw new AppException("Refresh token không tồn tại trong yêu cầu hoặc Cookie!", HttpStatus.BAD_REQUEST);
        }

        // Tìm token cũ
        RefreshToken oldRefreshToken = refreshTokenService.findByToken(requestRefreshToken)
                .orElseThrow(() -> new AppException("Refresh token không tồn tại hoặc đã bị thu hồi!", HttpStatus.FORBIDDEN));

        // Kiểm tra hết hạn
        refreshTokenService.verifyExpiration(oldRefreshToken);

        User user = oldRefreshToken.getUser();

        // Thực hiện Refresh Token Rotation: Hủy token cũ và cấp token mới
        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(oldRefreshToken);

        // Sinh mới Access Token
        String newAccessToken = jwtProvider.generateToken(user);

        // Cập nhật lại HttpOnly Cookie mới
        ResponseCookie cookie = buildRefreshTokenCookie(newRefreshToken.getToken(), 7 * 24 * 60 * 60);
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.<TokenRefreshResponse>builder()
                .success(true)
                .message("Làm mới token thành công")
                .data(TokenRefreshResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken.getToken())
                        .userId(user.getUserId())
                        .username(user.getActualUsername())
                        .email(user.getEmail())
                        .role(user.getRole().getRoleName())
                        .build())
                .build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AppException("Chưa xác thực người dùng", HttpStatus.UNAUTHORIZED);
        }

        Object principal = authentication.getPrincipal();
        String email;

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        } else {
            throw new AppException("Không thể xác định thông tin người dùng", HttpStatus.UNAUTHORIZED);
        }

        authService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Đổi mật khẩu thành công")
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {

        // 1. Blacklist Access Token hiện tại trong Redis
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            long remainingMs = jwtProvider.getRemainingExpirationMs(jwt);
            if (remainingMs > 0) {
                tokenBlacklistService.blacklistToken(jwt, remainingMs);
            }
        }

        // 2. Thu hồi Refresh Token trong DB và Redis
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                refreshTokenService.deleteByUserId(user.getUserId());
            } else if (principal instanceof UserDetails) {
                String email = ((UserDetails) principal).getUsername();
                userRepository.findByEmail(email).ifPresent(u -> refreshTokenService.deleteByUserId(u.getUserId()));
            }
        }

        // 3. Xóa HttpOnly Cookie phía Client
        ResponseCookie clearCookie = buildRefreshTokenCookie("", 0);
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Đăng xuất thành công")
                .build());
    }

    private ResponseCookie buildRefreshTokenCookie(String token, long maxAgeSeconds) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false) // Đặt true khi deploy HTTPS Production
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}