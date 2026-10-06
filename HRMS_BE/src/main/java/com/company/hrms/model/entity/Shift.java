package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entity: Shift
 * Chức năng: Lưu trữ các KHUÔN MẪU ca làm việc chuẩn của công ty.
 * Ví dụ: Ca Hành chính (08:00-17:00), Ca Đêm (22:00-06:00).
 */
@Entity
@Table(name = "shifts")
@Getter
@Setter
public class Shift {
    @Id
    @Column(name = "shift_code", length = 20, unique = true)
    private String shiftCode;

    @Column(name = "shift_name", length = 50, nullable = false)
    private String shiftName;

    @Column(name = "shift_date")
    private LocalDate shiftDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "break_duration")
    private Integer breakDuration = 0;
}