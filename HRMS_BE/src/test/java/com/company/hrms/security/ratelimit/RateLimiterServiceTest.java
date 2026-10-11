package com.company.hrms.security.ratelimit;

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
public class RateLimiterServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private RateLimiterService rateLimiterService;

    @Test
    @DisplayName("Cho phép yêu cầu khi số lượt chưa vượt ngưỡng giới hạn")
    void shouldAllowWhenUnderLimit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("rate_limit:login:127.0.0.1")).thenReturn(1L);

        boolean allowed = rateLimiterService.tryAcquire("login:127.0.0.1", 5, Duration.ofMinutes(1));

        assertTrue(allowed);
        verify(redisTemplate).expire(eq("rate_limit:login:127.0.0.1"), eq(Duration.ofMinutes(1)));
    }

    @Test
    @DisplayName("Chặn yêu cầu khi số lượt vượt quá ngưỡng tối đa cho phép")
    void shouldBlockWhenExceedingLimit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("rate_limit:login:127.0.0.1")).thenReturn(6L);

        boolean allowed = rateLimiterService.tryAcquire("login:127.0.0.1", 5, Duration.ofMinutes(1));

        assertFalse(allowed);
    }

    @Test
    @DisplayName("Tự động chuyển sang In-memory fallback khi Redis lỗi")
    void shouldFallbackToInMemoryWhenRedisThrowsException() {
        when(redisTemplate.opsForValue()).thenThrow(new RuntimeException("Redis connection refused"));

        // Thử 3 lần với limit = 2
        assertTrue(rateLimiterService.tryAcquire("fallback:1.1.1.1", 2, Duration.ofSeconds(10)));
        assertTrue(rateLimiterService.tryAcquire("fallback:1.1.1.1", 2, Duration.ofSeconds(10)));
        assertFalse(rateLimiterService.tryAcquire("fallback:1.1.1.1", 2, Duration.ofSeconds(10)));
    }
}
