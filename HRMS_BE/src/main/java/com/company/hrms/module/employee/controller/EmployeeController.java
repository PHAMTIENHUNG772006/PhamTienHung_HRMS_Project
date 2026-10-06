package com.company.hrms.module.employee.controller;

import com.company.hrms.model.dto.request.EmployeeRequest;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.EmployeeResponse;
import com.company.hrms.module.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees() {
        return ResponseEntity.ok(ApiResponse.<List<EmployeeResponse>>builder()
                .success(true)
                .message("Lấy danh sách nhân viên thành công")
                .data(employeeService.getAllEmployees())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .success(true)
                .message("Lấy thông tin nhân viên thành công")
                .data(employeeService.getEmployeeById(id))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .success(true)
                .message("Thêm nhân viên thành công")
                .data(employeeService.createEmployee(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.<EmployeeResponse>builder()
                .success(true)
                .message("Cập nhật thông tin nhân viên thành công")
                .data(employeeService.updateEmployee(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa nhân viên thành công")
                .build());
    }
}