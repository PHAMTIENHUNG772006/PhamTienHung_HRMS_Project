package com.company.hrms.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Long employeeId;
    private Long userId;
    private String fullName;
    private Long idCardNumber;
    private Long departmentId;
    private String departmentName;
    private Long positionId;
    private String positionName;
    private LocalDate joiningDate;
    private String status;
    private String bankAccountNumber;
    private java.math.BigDecimal basicSalary;
}