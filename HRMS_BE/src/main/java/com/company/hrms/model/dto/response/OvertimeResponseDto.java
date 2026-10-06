package com.company.hrms.model.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class OvertimeResponseDto {
    private Long otRequestId;
    private Long employeeId;
    private String employeeName;
    private LocalDate otDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Float approvedHours;
    private String status;
}