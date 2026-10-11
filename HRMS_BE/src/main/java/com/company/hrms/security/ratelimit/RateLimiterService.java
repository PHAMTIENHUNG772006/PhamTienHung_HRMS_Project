package com.company.hrms.security.ratelimit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimiterService {

    private final RedisTemplate<String, Object> redisTemplate;

    // Fallback bộ nhớ RAM nếu Redis gặp sự cố
    private final Map<String, ConcurrentLinkedQueue<Instant>> memoryStore = new ConcurrentHashMap<>();

    /**
     * Kiểm tra xem key có bị vượt quá giới hạn lượt gọi hay không.
     *
     * @param key         Định danh duy nhất (thường là IP hoặc email)
     * @param maxRequests Số lượt yêu cầu tối đa cho phép
     * @param window      Khoảng thời gian giới hạn
     * @return true nếu còn trong hạn mức, false nếu đã vượt ngưỡng
     */
    public boolean tryAcquire(String key, int maxRequests, Duration window) {
        String redisKey = "rate_limit:" + key;
        try {
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null && count == 1) {
                redisTemplate.expire(redisKey, window);
            }
            return count != null && count <= maxRequests;
        } catch (Exception e) {
            log.warn("Redis không khả dụng cho Rate Limiting ({}), chuyển sang bộ nhớ đệm nội bộ", e.getMessage());
            return tryAcquireInMemory(key, maxRequests, window);
        }
    }

    private boolean tryAcquireInMemory(String key, int maxRequests, Duration window) {
        Instant now = Instant.now();
        Instant cutoff = now.minus(window);

        ConcurrentLinkedQueue<Instant> timestamps = memoryStore.computeIfAbsent(key, k -> new ConcurrentLinkedQueue<>());
        
        // Dọn dẹp các mốc thời gian ngoài cửa sổ
        while (!timestamps.isEmpty() && timestamps.peek().isBefore(cutoff)) {
            timestamps.poll();
        }

        if (timestamps.size() < maxRequests) {
            timestamps.add(now);
            return true;
        }
        return false;
    }
}
