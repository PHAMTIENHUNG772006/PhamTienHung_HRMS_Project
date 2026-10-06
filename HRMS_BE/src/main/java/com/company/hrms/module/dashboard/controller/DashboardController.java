package com.company.hrms.module.dashboard.controller;

import com.company.hrms.model.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        // Logic để lấy các chỉ số từ service
        Map<String, Object> stats = Map.of(
            "totalEmployees", 150,
            "onLeave", 5,
            "pendingRequests", 12
        );
        
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Lấy dữ liệu dashboard thành công")
                .data(stats)
                .build());
    }
}