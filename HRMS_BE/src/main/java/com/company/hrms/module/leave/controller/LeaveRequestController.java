package com.company.hrms.module.leave.controller;

import com.company.hrms.model.dto.request.LeaveRequestDto;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.LeaveResponseDto;
import com.company.hrms.module.leave.service.LeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<LeaveResponseDto>>> getAllLeaveRequests() {
        return ResponseEntity.ok(ApiResponse.<List<LeaveResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách đơn xin nghỉ phép thành công")
                .data(leaveRequestService.getAllLeaveRequests())
                .build());
    }

    @PostMapping
    @PreAuthorize("@securityService.canCreateLeaveRequest(#request.employeeId, authentication)")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> createLeaveRequest(@Valid @RequestBody LeaveRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<LeaveResponseDto>builder()
                .success(true)
                .message("Tạo đơn xin nghỉ phép thành công")
                .data(leaveRequestService.createLeaveRequest(request))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.canModifyLeaveRequest(#id, authentication)")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> updateLeaveRequest(@PathVariable Long id, @Valid @RequestBody LeaveRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<LeaveResponseDto>builder()
                .success(true)
                .message("Cập nhật đơn xin nghỉ phép thành công")
                .data(leaveRequestService.updateLeaveRequest(id, request))
                .build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(ApiResponse.<LeaveResponseDto>builder()
                .success(true)
                .message("Cập nhật trạng thái đơn thành công")
                .data(leaveRequestService.updateLeaveRequestStatus(id, status))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.canModifyLeaveRequest(#id, authentication)")
    public ResponseEntity<ApiResponse<Void>> deleteLeaveRequest(@PathVariable Long id) {
        leaveRequestService.deleteLeaveRequest(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa đơn xin nghỉ phép thành công")
                .build());
    }
}