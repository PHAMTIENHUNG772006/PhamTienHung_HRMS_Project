package com.company.hrms.model.dto.response;

import com.company.hrms.model.entity.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AttendanceResponseDto {
    private Long attendanceId;
    private Long employeeId;
    private String employeeName;
    private LocalDate workDate;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private AttendanceStatus status;
    private Integer lateMinutes;
    private Integer earlyMinutes;
    private String checkInImage;
    private String checkOutImage;
    private String shiftCode;
    private String shiftName;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private Double actualHours;
    private Boolean isFullWorkDay;
}