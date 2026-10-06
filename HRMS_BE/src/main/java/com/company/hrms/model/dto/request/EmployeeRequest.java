package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeRequest {
    private Long userId;

    @NotBlank(message = "Tên nhân viên không được để trống")
    private String fullName;

    @NotNull(message = "Số CCCD không được để trống")
    private Long idCardNumber;

    @NotNull(message = "Phòng ban không được để trống")
    private Long departmentId;

    @NotNull(message = "Chức vụ không được để trống")
    private Long positionId;

    @NotNull(message = "Ngày tham gia không được để trống")
    private LocalDate joiningDate;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;

    @NotBlank(message = "Số tài khoản thanh toán lương không được để trống")
    private String bankAccountNumber;

    @NotNull(message = "Lương cơ bản không được để trống")
    private java.math.BigDecimal basicSalary;
}