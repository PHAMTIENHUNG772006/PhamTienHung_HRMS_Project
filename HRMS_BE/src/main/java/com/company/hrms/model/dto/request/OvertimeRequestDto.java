package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class OvertimeRequestDto {
    @NotNull(message = "ID nhân viên không được để trống")
    private Long employeeId;

    @NotNull(message = "Ngày OT không được để trống")
    private LocalDate otDate;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    private LocalTime endTime;

    private String status;
}