package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

/**
 * Entity: Employee
 * Chức năng: Lưu trữ HỒ SƠ NHÂN SỰ thực tế của nhân viên.
 * Liên quan: Module Quản lý nhân viên (F03). Chứa thông tin cá nhân (Tên, CCCD), 
 * liên kết với Phòng ban (Department), Chức vụ (Position) và Tài khoản (User).
 */
@Entity
@Table(name = "employees")
@Getter
@Setter
public class Employee extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    private Long employeeId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "id_card_number", unique = true, nullable = false)
    private Long idCardNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "basic_salary", precision = 15, scale = 2)
    private java.math.BigDecimal basicSalary;
}