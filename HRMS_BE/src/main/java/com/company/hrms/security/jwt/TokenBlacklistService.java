package com.company.hrms.security.jwt;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Thêm Access Token vào Redis Blacklist với TTL xác định.
     * @param token Chuỗi token cần blacklist
     * @param durationMs Thời gian sống còn lại của token (mili giây)
     */
    public void blacklistToken(String token, long durationMs) {
        if (token == null || durationMs <= 0) {
            return;
        }
        try {
            String key = BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(key, "revoked", Duration.ofMillis(durationMs));
            log.info("Token successfully blacklisted for {} ms", durationMs);
        } catch (Exception e) {
            log.error("Failed to blacklist token in Redis: {}", e.getMessage());
        }
    }

    /**
     * Kiểm tra xem token có nằm trong blacklist hay không.
     * @param token Chuỗi token cần kiểm tra
     * @return true nếu đã bị blacklist, false nếu hợp lệ
     */
    public boolean isBlacklisted(String token) {
        if (token == null) {
            return false;
        }
        try {
            String key = BLACKLIST_PREFIX + token;
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("Failed to check token blacklist in Redis: {}", e.getMessage());
            return false;
        }
    }
}
