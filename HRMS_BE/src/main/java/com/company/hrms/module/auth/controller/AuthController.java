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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtProvider jwtProvider;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
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
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtProvider.generateToken(user);
                    return ResponseEntity.ok(ApiResponse.<TokenRefreshResponse>builder()
                            .success(true)
                            .message("Token refreshed successfully")
                            .data(TokenRefreshResponse.builder()
                                    .accessToken(token)
                                    .refreshToken(requestRefreshToken)
                                    .userId(user.getUserId())
                                    .username(user.getActualUsername())
                                    .email(user.getEmail())
                                    .role(user.getRole().getRoleName())
                                    .build())
                            .build());
                })
                .orElseThrow(() -> new AppException("Refresh token is not in database!", HttpStatus.FORBIDDEN));
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
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                refreshTokenService.deleteByUserId(user.getUserId());
            } else if (principal instanceof UserDetails) {
                 // Nếu principal bị bọc bởi UserDetails của Spring thì lấy email query ra id
                 // Tùy theo cách implement, ở đây ta giả sử nó là User
            }
        }
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Đăng xuất thành công")
                .build());
    }
}