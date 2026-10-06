package com.company.hrms.security.jwt;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.entity.RefreshToken;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.auth.repository.RefreshTokenRepository;
import com.company.hrms.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private String getRedisKey(String token) {
        return "refresh_token:" + token;
    }

    public Optional<RefreshToken> findByToken(String token) {
        // 1. Tìm trong Redis trước
        String redisKey = getRedisKey(token);
        try {
            RefreshToken refreshTokenFromRedis = (RefreshToken) redisTemplate.opsForValue().get(redisKey);
            if (refreshTokenFromRedis != null) {
                return Optional.of(refreshTokenFromRedis);
            }
        } catch (Exception e) {
            // Fallback to DB on Redis connection or serialization error
        }

        // 2. Nếu không có, tìm trong DB
        Optional<RefreshToken> refreshTokenFromDb = refreshTokenRepository.findByToken(token);
        
        // 3. Nếu tìm thấy trong DB, cache nó vào Redis
        try {
            refreshTokenFromDb.ifPresent(rt -> {
                redisTemplate.opsForValue().set(redisKey, rt, Duration.ofMillis(refreshTokenDurationMs));
            });
        } catch (Exception e) {
            // Ignore Redis cache writing failure
        }
        
        return refreshTokenFromDb;
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // XÓA BẰNG CÂU LỆNH MODIFING THAY VÌ TÌM RỒI XÓA ĐỂ TRÁNH LỖI ĐỒNG BỘ
        Optional<RefreshToken> oldTokenOpt = refreshTokenRepository.findByUserUserId(userId);
        if (oldTokenOpt.isPresent()) {
            try {
                redisTemplate.delete(getRedisKey(oldTokenOpt.get().getToken()));
            } catch (Exception e) {
                // Ignore Redis delete failure
            }
        }
        
        // Gọi thẳng hàm deleteByUser có sẵn để ép Hibernate xóa sạch trước khi thêm
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush(); // Bắt buộc đẩy query DELETE xuống DB ngay lập tức

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .build();

        // Lưu vào DB trước
        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        
        // Sau đó cache vào Redis
        try {
            redisTemplate.opsForValue().set(getRedisKey(savedToken.getToken()), savedToken, Duration.ofMillis(refreshTokenDurationMs));
        } catch (Exception e) {
            // Ignore Redis set failure
        }

        return savedToken;
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            // Xóa khỏi Redis và DB
            try {
                redisTemplate.delete(getRedisKey(token.getToken()));
            } catch (Exception e) {
                // Ignore Redis delete failure
            }
            refreshTokenRepository.delete(token);
            throw new AppException("Refresh token was expired. Please make a new signin request", HttpStatus.FORBIDDEN);
        }
        return token;
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if(user != null){
             Optional<RefreshToken> oldTokenOpt = refreshTokenRepository.findByUserUserId(userId);
             if (oldTokenOpt.isPresent()) {
                 try {
                     redisTemplate.delete(getRedisKey(oldTokenOpt.get().getToken()));
                 } catch (Exception e) {
                     // Ignore Redis delete failure
                 }
             }
             refreshTokenRepository.deleteByUser(user);
        }
    }

    public long getRefreshTokenDurationMs() {
        return refreshTokenDurationMs;
    }
}