package com.company.hrms.module.payroll.service;

import com.company.hrms.model.dto.response.PayrollResponseDto;
import java.util.List;

public interface PayrollService {
    List<PayrollResponseDto> getAllPayrolls();
    List<PayrollResponseDto> calculatePayroll(String period);
    PayrollResponseDto updatePayrollStatus(Long id, String status);
}