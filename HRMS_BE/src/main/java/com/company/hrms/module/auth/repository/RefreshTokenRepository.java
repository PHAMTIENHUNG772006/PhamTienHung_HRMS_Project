package com.company.hrms.module.auth.repository;

import com.company.hrms.model.entity.RefreshToken;
import com.company.hrms.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUserUserId(Long userId);
    
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.user = ?1")
    int deleteByUser(User user);
}