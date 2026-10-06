package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ShiftAssignmentRequestDto {
    @NotNull(message = "Danh sách ID nhân viên không được để trống")
    private List<Long> employeeIds;

    @NotNull(message = "Mã ca làm việc không được để trống")
    private String shiftCode;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate fromDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate toDate;
}