package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity: Department
 * Chức năng: Lưu trữ thông tin PHÒNG BAN trong công ty.
 * Liên quan: Module Quản lý phòng ban (F04). Nhân viên (Employee) sẽ được phân bổ vào các phòng ban này.
 */
@Entity
@Table(
        name = "departments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "department_code")
        }
)
@Getter
@Setter
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "department_code", nullable = false, length = 20)
    private String departmentCode;

    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    @Column(length = 255)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @Column(name = "is_active")
    private Boolean active = true;
}