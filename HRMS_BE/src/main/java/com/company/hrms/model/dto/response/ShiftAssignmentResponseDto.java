package com.company.hrms.model.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class ShiftAssignmentResponseDto {
    private Long assignmentId;
    private Long employeeId;
    private String employeeName;
    private String shiftCode;
    private String shiftName;
    private java.time.LocalTime startTime;
    private java.time.LocalTime endTime;
    private LocalDate assignDate;
}