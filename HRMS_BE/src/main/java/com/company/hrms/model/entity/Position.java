package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity: Position
 * Chức năng: Lưu trữ thông tin CHỨC VỤ / VỊ TRÍ CÔNG VIỆC.
 * Liên quan: Module Quản lý chức vụ (F04). Nhân viên (Employee) sẽ được gán một chức vụ cụ thể.
 */
@Entity
@Table(name = "positions")
@Getter
@Setter
public class Position extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long positionId;

    @Column(nullable = false)
    private String positionName;

    @Column(nullable = false)
    private String salaryGrade;

    @Column
    private Boolean active = true;
}