package com.company.hrms.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity: Role
 * Chức năng: Định nghĩa các VAI TRÒ (quyền hạn) trong hệ thống như ADMIN, HR, MANAGER...
 * Liên quan: Module Auth (F02). Được gán cho User để phân quyền truy cập.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "role_name", length = 50, unique = true, nullable = false)
    private String roleName;

    @Column(length = 255)
    private String description;
}