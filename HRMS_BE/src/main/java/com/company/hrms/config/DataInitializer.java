package com.company.hrms.config;

import com.company.hrms.model.entity.Role;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.auth.repository.RoleRepository;
import com.company.hrms.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Tạo các Role mặc định nếu chưa có
        // Lưu ý: Đã loại bỏ role RECRUITER theo yêu cầu mới
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("HR");
        createRoleIfNotFound("MANAGER");
        createRoleIfNotFound("PAYROLL");
        createRoleIfNotFound("EMPLOYEE");
        
        // Giữ lại CANDIDATE cho luồng đăng ký ứng viên bên ngoài (nếu có)
        createRoleIfNotFound("CANDIDATE");

        // 2. Tạo tài khoản Admin mặc định
        if (!userRepository.existsByEmail("admin@company.com")) {
            Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Error: Role ADMIN is not found."));

            User admin = new User();
            admin.setUsername("Administrator");
            admin.setEmail("admin@company.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole);
            admin.setStatus("ACTIVE");
            admin.setIsTemporaryPassword(false);

            userRepository.save(admin);
            log.info("Default Admin account created: admin@company.com / admin123");
        }
    }

    private void createRoleIfNotFound(String roleName) {
        if (roleRepository.findByRoleName(roleName).isEmpty()) {
            Role role = new Role();
            role.setRoleName(roleName);
            roleRepository.save(role);
            log.info("Created role: {}", roleName);
        }
    }
}