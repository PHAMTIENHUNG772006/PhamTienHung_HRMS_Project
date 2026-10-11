package com.company.hrms.module.shift.controller;

import com.company.hrms.model.dto.request.ShiftRequestDto;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.ShiftResponseDto;
import com.company.hrms.module.shift.service.ShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ShiftResponseDto>>> getAllShifts() {
        return ResponseEntity.ok(ApiResponse.<List<ShiftResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách ca làm việc thành công")
                .data(shiftService.getAllShifts())
                .build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponseDto>> createShift(@Valid @RequestBody ShiftRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<ShiftResponseDto>builder()
                .success(true)
                .message("Tạo ca làm việc thành công")
                .data(shiftService.createShift(request))
                .build());
    }

    @PutMapping("/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponseDto>> updateShift(@PathVariable String code, @Valid @RequestBody ShiftRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<ShiftResponseDto>builder()
                .success(true)
                .message("Cập nhật ca làm việc thành công")
                .data(shiftService.updateShift(code, request))
                .build());
    }

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteShift(@PathVariable String code) {
        shiftService.deleteShift(code);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa ca làm việc thành công")
                .build());
    }

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<ShiftResponseDto>>> getTodayShifts() {
        return ResponseEntity.ok(ApiResponse.<List<ShiftResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách ca làm việc hôm nay thành công")
                .data(shiftService.getShiftsByDate(java.time.LocalDate.now()))
                .build());
    }
}