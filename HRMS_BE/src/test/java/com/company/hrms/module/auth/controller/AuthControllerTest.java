package com.company.hrms.module.auth.controller;

import com.company.hrms.common.exception.GlobalExceptionHandler;
import com.company.hrms.model.dto.request.LoginRequest;
import com.company.hrms.model.dto.response.AuthResponse;
import com.company.hrms.model.entity.RefreshToken;
import com.company.hrms.model.entity.Role;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.auth.repository.UserRepository;
import com.company.hrms.module.auth.service.AuthService;
import com.company.hrms.security.jwt.JwtProvider;
import com.company.hrms.security.jwt.RefreshTokenService;
import com.company.hrms.security.jwt.TokenBlacklistService;
import com.company.hrms.security.ratelimit.RateLimiterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private JwtProvider jwtProvider;
    @Mock
    private TokenBlacklistService tokenBlacklistService;
    @Mock
    private RateLimiterService rateLimiterService;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Đăng nhập thành công và trả về Set-Cookie HttpOnly cho Refresh Token")
    void shouldLoginSuccessfullyAndSetHttpOnlyCookie() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "Password123!");
        AuthResponse authResponse = AuthResponse.builder()
                .token("mock-access-token")
                .refreshToken("mock-refresh-token")
                .username("testuser")
                .email("test@example.com")
                .role("EMPLOYEE")
                .build();

        when(rateLimiterService.tryAcquire(anyString(), anyInt(), any())).thenReturn(true);
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mock-access-token"))
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("refreshToken=")));
    }

    @Test
    @DisplayName("Chặn đăng nhập với mã 429 Too Many Requests khi vượt quá Rate Limit")
    void shouldBlockLoginWhenRateLimitExceeded() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "Password123!");

        when(rateLimiterService.tryAcquire(anyString(), anyInt(), any())).thenReturn(false);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Quá nhiều yêu cầu đăng nhập")));
    }

    @Test
    @DisplayName("Làm mới token qua HttpOnly Cookie thành công")
    void shouldRefreshTokenViaHttpOnlyCookie() throws Exception {
        Role role = new Role();
        role.setRoleId(1L);
        role.setRoleName("EMPLOYEE");

        User user = new User();
        user.setUserId(5L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setRole(role);

        RefreshToken oldToken = new RefreshToken();
        oldToken.setToken("valid-cookie-refresh-token");
        oldToken.setUser(user);

        RefreshToken newToken = new RefreshToken();
        newToken.setToken("rotated-refresh-token");
        newToken.setUser(user);

        when(refreshTokenService.findByToken("valid-cookie-refresh-token")).thenReturn(Optional.of(oldToken));
        when(refreshTokenService.rotateRefreshToken(oldToken)).thenReturn(newToken);
        when(jwtProvider.generateToken(user)).thenReturn("new-access-token");

        mockMvc.perform(post("/api/v1/auth/refresh-token")
                        .cookie(new Cookie("refreshToken", "valid-cookie-refresh-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("new-access-token"))
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("rotated-refresh-token")));
    }

    @Test
    @DisplayName("Đăng xuất thành công và xóa sạch HttpOnly Cookie (Max-Age=0)")
    void shouldLogoutSuccessfullyAndClearCookie() throws Exception {
        when(jwtProvider.getRemainingExpirationMs("valid-jwt")).thenReturn(300000L);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer valid-jwt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));

        verify(tokenBlacklistService).blacklistToken(eq("valid-jwt"), eq(300000L));
    }
}
