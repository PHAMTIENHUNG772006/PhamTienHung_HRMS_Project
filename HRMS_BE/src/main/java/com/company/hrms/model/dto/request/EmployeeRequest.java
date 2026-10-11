package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeRequest {
    private Long userId;

    @NotBlank(message = "Tên nhân viên không được để trống")
    @Size(min = 2, max = 100, message = "Tên nhân viên phải có độ dài từ 2 đến 100 ký tự")
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
    @Size(max = 30, message = "Trạng thái tối đa 30 ký tự")
    private String status;

    @NotBlank(message = "Số tài khoản thanh toán lương không được để trống")
    @Pattern(regexp = "^[0-9A-Za-z]{6,30}$", message = "Số tài khoản ngân hàng phải gồm 6-30 ký tự chữ hoặc số")
    private String bankAccountNumber;

    @NotNull(message = "Lương cơ bản không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Lương cơ bản không được âm")
    private BigDecimal basicSalary;
}