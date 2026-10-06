package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequestDto {
    @NotNull(message = "ID nhân viên không được để trống")
    private Long employeeId;

    @NotBlank(message = "Loại nghỉ phép không được để trống")
    private String leaveType;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @FutureOrPresent(message = "Ngày bắt đầu nghỉ phép không được là ngày trong quá khứ")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @FutureOrPresent(message = "Ngày kết thúc nghỉ phép không được là ngày trong quá khứ")
    private LocalDate endDate;

    @NotNull(message = "Tổng số ngày không được để trống")
    private Float totalDays;

    private String status;
}