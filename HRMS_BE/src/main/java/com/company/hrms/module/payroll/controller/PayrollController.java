package com.company.hrms.module.payroll.controller;

import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.PayrollResponseDto;
import com.company.hrms.module.payroll.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PayrollResponseDto>>> getAllPayrolls() {
        return ResponseEntity.ok(ApiResponse.<List<PayrollResponseDto>>builder()
                .success(true)
                .data(payrollService.getAllPayrolls())
                .build());
    }

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<List<PayrollResponseDto>>> calculatePayroll(@RequestBody Map<String, String> body) {
        String period = body.get("period");
        List<PayrollResponseDto> result = payrollService.calculatePayroll(period);
        return ResponseEntity.ok(ApiResponse.<List<PayrollResponseDto>>builder()
                .success(true)
                .message("Tính toán bảng lương thành công!")
                .data(result)
                .build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PayrollResponseDto>> updatePayrollStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        PayrollResponseDto result = payrollService.updatePayrollStatus(id, status);
        return ResponseEntity.ok(ApiResponse.<PayrollResponseDto>builder()
                .success(true)
                .message("Cập nhật trạng thái bảng lương thành công!")
                .data(result)
                .build());
    }
}