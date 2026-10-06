package com.company.hrms.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Entity: User
 * Chức năng: Lưu trữ thông tin TÀI KHOẢN ĐĂNG NHẬP của hệ thống.
 * Liên quan: Module Auth (F01, F02). Quản lý mật khẩu, email và liên kết với Role.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User extends BaseEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 50, unique = true, nullable = false)
    private String username;

    @JsonIgnore 
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "email", length = 100, unique = true, nullable = false)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "status", length = 20)
    private String status = "ACTIVE";

    @Column(name = "is_temporary_password")
    private Boolean isTemporaryPassword = false;

    @Column(name = "bank_account_number", length = 30)
    private String bankAccountNumber;

    // --- Implement methods of UserDetails interface ---

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null) return Collections.emptyList();
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.getRoleName()));
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return passwordHash;
    }

    // Spring Security expects getUsername() to return the identifier used for login
    // In our case, it's the email.
    @Override
    public String getUsername() {
        return email; 
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return !"INACTIVE".equals(status);
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return "ACTIVE".equals(status);
    }

    public String getActualUsername() {
        return this.username;
    }
}