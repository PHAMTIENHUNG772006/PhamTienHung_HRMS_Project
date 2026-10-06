package com.company.hrms.module.overtime.controller;

import com.company.hrms.model.dto.request.OvertimeRequestDto;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.OvertimeResponseDto;
import com.company.hrms.module.overtime.service.OvertimeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/overtime-requests")
@RequiredArgsConstructor
public class OvertimeRequestController {

    private final OvertimeRequestService overtimeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OvertimeResponseDto>>> getAllOvertimeRequests() {
        return ResponseEntity.ok(ApiResponse.<List<OvertimeResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách đơn OT thành công")
                .data(overtimeService.getAllOvertimeRequests())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OvertimeResponseDto>> createOvertimeRequest(@Valid @RequestBody OvertimeRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<OvertimeResponseDto>builder()
                .success(true)
                .message("Tạo đơn OT thành công")
                .data(overtimeService.createOvertimeRequest(request))
                .build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OvertimeResponseDto>> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String status = (String) payload.get("status");
        Float approvedHours = payload.get("approvedHours") != null ? ((Number) payload.get("approvedHours")).floatValue() : null;
        return ResponseEntity.ok(ApiResponse.<OvertimeResponseDto>builder()
                .success(true)
                .message("Cập nhật trạng thái đơn OT thành công")
                .data(overtimeService.updateOvertimeRequestStatus(id, status, approvedHours))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OvertimeResponseDto>> updateOvertimeRequest(@PathVariable Long id, @Valid @RequestBody OvertimeRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<OvertimeResponseDto>builder()
                .success(true)
                .message("Cập nhật đơn OT thành công")
                .data(overtimeService.updateOvertimeRequest(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOvertimeRequest(@PathVariable Long id) {
        overtimeService.deleteOvertimeRequest(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa đơn OT thành công")
                .build());
    }
}