package com.company.hrms.model.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PayrollResponseDto {
    private Long payrollId;
    private Long employeeId;
    private String employeeName;
    private String salaryPeriod;
    private BigDecimal basicSalary;
    private BigDecimal allowance;
    private BigDecimal overtimePay;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private String status;
}