package com.company.hrms.module.auth.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.ChangePasswordRequest;
import com.company.hrms.model.dto.request.LoginRequest;
import com.company.hrms.model.dto.request.RegisterRequest;
import com.company.hrms.model.dto.response.AuthResponse;
import com.company.hrms.model.entity.RefreshToken;
import com.company.hrms.model.entity.Role;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.auth.repository.RoleRepository;
import com.company.hrms.module.auth.repository.UserRepository;
import com.company.hrms.module.auth.service.AuthService;
import com.company.hrms.security.jwt.JwtProvider;
import com.company.hrms.security.jwt.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = (User) authentication.getPrincipal();

            if ("INACTIVE".equals(user.getStatus())) {
                throw new AppException("Tài khoản đã bị khóa", HttpStatus.FORBIDDEN);
            }

            String token = jwtProvider.generateToken(user);

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUserId());

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken.getToken())
                    .userId(user.getUserId())
                    .username(user.getActualUsername())
                    .email(user.getEmail())
                    .role(user.getRole().getRoleName())
                    .isTemporaryPassword(user.getIsTemporaryPassword())
                    .build();
        } catch (BadCredentialsException e) {
            throw new AppException("Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED);
        }
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getFullName())) {
            throw new AppException("Tên đăng nhập đã tồn tại!", HttpStatus.CONFLICT);
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email đã được sử dụng!", HttpStatus.CONFLICT);
        }

        Role role = roleRepository.findByRoleName("CANDIDATE")
                .orElseThrow(() -> new AppException("Vai trò ứng viên (CANDIDATE) chưa được thiết lập", HttpStatus.INTERNAL_SERVER_ERROR));

        User user = new User();
        user.setUsername(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setStatus("ACTIVE");
        user.setIsTemporaryPassword(false);

        User savedUser = userRepository.save(user);

        String token = jwtProvider.generateToken(savedUser);
        
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getUserId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .userId(savedUser.getUserId())
                .username(savedUser.getActualUsername())
                .email(savedUser.getEmail())
                .role(role.getRoleName())
                .isTemporaryPassword(false)
                .build();
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new AppException("Mật khẩu cũ không chính xác", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setIsTemporaryPassword(false);
        userRepository.save(user);
    }
}