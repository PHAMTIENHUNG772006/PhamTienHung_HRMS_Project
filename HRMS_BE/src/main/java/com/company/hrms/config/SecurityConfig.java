package com.company.hrms.config;

import com.company.hrms.security.jwt.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                
                // F02: Quản lý Tài khoản & Quyền hạn
                .requestMatchers("/api/v1/accounts/**").hasRole("ADMIN")
                
                // F03: Quản lý Hồ sơ nhân viên
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/employees/**").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                .requestMatchers("/api/v1/employees/**").hasAnyRole("ADMIN", "HR")
                
                // F04: Quản lý Phòng ban & Chức vụ
                .requestMatchers("/api/v1/departments/**", "/api/v1/positions/**").hasAnyRole("ADMIN", "HR")
                
                // F05: Chấm công
                .requestMatchers("/api/v1/attendance/check-in", "/api/v1/attendance/check-out", "/api/v1/attendance/my").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                .requestMatchers("/api/v1/attendance/**").hasAnyRole("ADMIN", "HR")
                
                // F06, F07, F08: Ca làm việc, Nghỉ phép, Tăng ca
                .requestMatchers("/api/v1/shift-assignments/my-today").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                .requestMatchers("/api/v1/shifts/**", "/api/v1/shift-assignments/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/v1/leave-requests/*/status").hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers("/api/v1/leave-requests/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                .requestMatchers("/api/v1/overtime/**").hasAnyRole("ADMIN", "HR", "MANAGER")
                
                // F09: Tính toán lương
                .requestMatchers("/api/v1/payroll/**").hasAnyRole("ADMIN", "PAYROLL")
                
                // F10: Quản lý Chiến dịch tuyển dụng (Đã cập nhật: ADMIN và HR)
                .requestMatchers("/api/v1/recruitment/**").hasAnyRole("ADMIN", "HR")
                
                // F11: Cấp phát & Thu hồi Tài sản
                .requestMatchers("/api/v1/assets/**").hasAnyRole("ADMIN", "HR")
                
                // F12: Dashboard & Báo cáo
                .requestMatchers("/api/v1/dashboard/**", "/api/v1/reports/**").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*")); 
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}