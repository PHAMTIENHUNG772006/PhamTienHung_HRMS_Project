package com.company.hrms.security.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenBlacklistServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private TokenBlacklistService tokenBlacklistService;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("Nên thêm token vào Redis với prefix và duration chính xác")
    void shouldBlacklistTokenSuccessfully() {
        String token = "sample-jwt-token";
        long durationMs = 60000;

        tokenBlacklistService.blacklistToken(token, durationMs);

        verify(valueOperations, times(1)).set(
                eq("jwt:blacklist:" + token),
                eq("revoked"),
                eq(Duration.ofMillis(durationMs))
        );
    }

    @Test
    @DisplayName("Nên trả về true khi token có trong Redis blacklist")
    void shouldReturnTrueWhenTokenIsBlacklisted() {
        String token = "revoked-token";
        when(redisTemplate.hasKey("jwt:blacklist:" + token)).thenReturn(true);

        boolean result = tokenBlacklistService.isBlacklisted(token);

        assertTrue(result);
        verify(redisTemplate, times(1)).hasKey("jwt:blacklist:" + token);
    }

    @Test
    @DisplayName("Nên trả về false khi token không có trong Redis blacklist")
    void shouldReturnFalseWhenTokenIsNotBlacklisted() {
        String token = "valid-token";
        when(redisTemplate.hasKey("jwt:blacklist:" + token)).thenReturn(false);

        boolean result = tokenBlacklistService.isBlacklisted(token);

        assertFalse(result);
    }

    @Test
    @DisplayName("Nên trả về false khi token null")
    void shouldReturnFalseWhenTokenIsNull() {
        boolean result = tokenBlacklistService.isBlacklisted(null);
        assertFalse(result);
        verifyNoInteractions(redisTemplate);
    }
}
