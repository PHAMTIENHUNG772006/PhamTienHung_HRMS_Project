package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

/**
 * Entity: Payroll
 * Chức năng: Lưu trữ BẢNG LƯƠNG chi tiết của từng nhân viên theo kỳ.
 * Liên quan: Module Tính lương (F11).
 */
@Entity
@Table(name = "payrolls")
@Getter
@Setter
public class Payroll extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payroll_id")
    private Long payrollId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "salary_period", length = 7, nullable = false) // Ví dụ: "2023-12"
    private String salaryPeriod;

    @Column(name = "basic_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "allowance", precision = 15, scale = 2)
    private BigDecimal allowance;

    @Column(name = "overtime_pay", precision = 15, scale = 2)
    private BigDecimal overtimePay;

    @Column(name = "deductions", precision = 15, scale = 2)
    private BigDecimal deductions;

    @Column(name = "net_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "status", length = 20, nullable = false)
    private String status;
}