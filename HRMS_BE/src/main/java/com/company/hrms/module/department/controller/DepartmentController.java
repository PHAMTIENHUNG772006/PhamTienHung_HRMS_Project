package com.company.hrms.module.department.controller;

import com.company.hrms.model.dto.request.DepartmentRequest;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.DepartmentResponse;
import com.company.hrms.module.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAllDepartments() {
        return ResponseEntity.ok(ApiResponse.<List<DepartmentResponse>>builder()
                .success(true)
                .message("Lấy danh sách phòng ban thành công")
                .data(departmentService.getAllDepartments())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<DepartmentResponse>builder()
                .success(true)
                .message("Lấy thông tin phòng ban thành công")
                .data(departmentService.getDepartmentById(id))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(ApiResponse.<DepartmentResponse>builder()
                .success(true)
                .message("Tạo phòng ban thành công")
                .data(departmentService.createDepartment(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(ApiResponse.<DepartmentResponse>builder()
                .success(true)
                .message("Cập nhật phòng ban thành công")
                .data(departmentService.updateDepartment(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa phòng ban thành công")
                .build());
    }
}