package com.company.hrms.model.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class ShiftResponseDto {
    private String shiftCode;
    private String shiftName;
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer breakDuration;
}