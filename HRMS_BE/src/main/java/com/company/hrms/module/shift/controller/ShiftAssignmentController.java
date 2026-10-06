package com.company.hrms.module.shift.controller;

import com.company.hrms.model.dto.request.ShiftAssignmentRequestDto;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.ShiftAssignmentResponseDto;
import com.company.hrms.module.shift.service.ShiftAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shift-assignments")
@RequiredArgsConstructor
public class ShiftAssignmentController {

    private final ShiftAssignmentService shiftAssignmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShiftAssignmentResponseDto>>> getShiftAssignments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        LocalDate actualStartDate = startDate != null ? startDate : LocalDate.of(1970, 1, 1);
        LocalDate actualEndDate = endDate != null ? endDate : LocalDate.of(9999, 12, 31);
        
        return ResponseEntity.ok(ApiResponse.<List<ShiftAssignmentResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách phân ca thành công")
                .data(shiftAssignmentService.getShiftAssignmentsByDateRange(actualStartDate, actualEndDate))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createShiftAssignments(@Valid @RequestBody ShiftAssignmentRequestDto request) {
        shiftAssignmentService.createShiftAssignments(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Phân ca làm việc thành công")
                .build());
    }

    @GetMapping("/my-today")
    public ResponseEntity<ApiResponse<List<ShiftAssignmentResponseDto>>> getMyShiftAssignmentsToday() {
        return ResponseEntity.ok(ApiResponse.<List<ShiftAssignmentResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách phân ca ngày hôm nay thành công")
                .data(shiftAssignmentService.getMyShiftAssignmentsToday())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShiftAssignment(@PathVariable Long id) {
        shiftAssignmentService.deleteShiftAssignment(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa phân ca làm việc thành công")
                .build());
    }
}