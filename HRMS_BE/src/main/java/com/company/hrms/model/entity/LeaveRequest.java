package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

/**
 * Entity: LeaveRequest
 * Chức năng: Lưu trữ thông tin các ĐƠN XIN NGHỈ PHÉP của nhân viên.
 * Liên quan: Module Quản lý nghỉ phép (F07).
 */
@Entity
@Table(name = "leave_requests")
@Getter
@Setter
public class LeaveRequest extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_request_id")
    private Long leaveRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "leave_type", length = 20, nullable = false)
    private String leaveType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_days", nullable = false)
    private Float totalDays;

    @Column(name = "status", length = 20, nullable = false)
    private String status;
}