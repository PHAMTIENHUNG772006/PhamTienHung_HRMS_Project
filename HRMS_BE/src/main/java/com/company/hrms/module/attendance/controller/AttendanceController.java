package com.company.hrms.module.attendance.controller;

import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.AttendanceResponseDto;
import com.company.hrms.module.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AttendanceResponseDto>>> getMyAttendances(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<AttendanceResponseDto>>builder()
                .success(true)
                .message("Lấy lịch sử chấm công cá nhân thành công")
                .data(attendanceService.getMyAttendances(authentication))
                .build());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<AttendanceResponseDto>>> getAllAttendances(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.<List<AttendanceResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách chấm công thành công")
                .data(attendanceService.getAllAttendances(startDate, endDate))
                .build());
    }

    @PostMapping(value = "/check-in", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> checkIn(
            Authentication authentication,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("shiftCode") String shiftCode) {
        
        return ResponseEntity.ok(ApiResponse.<AttendanceResponseDto>builder()
                .success(true)
                .message("Check-in thành công")
                .data(attendanceService.checkIn(authentication, image, shiftCode))
                .build());
    }

    @PostMapping(value = "/check-out", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttendanceResponseDto>> checkOut(
            Authentication authentication,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("shiftCode") String shiftCode) {
        
        return ResponseEntity.ok(ApiResponse.<AttendanceResponseDto>builder()
                .success(true)
                .message("Check-out thành công")
                .data(attendanceService.checkOut(authentication, image, shiftCode))
                .build());
    }
}