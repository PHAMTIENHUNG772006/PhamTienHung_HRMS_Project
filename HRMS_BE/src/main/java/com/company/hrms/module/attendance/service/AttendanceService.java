package com.company.hrms.module.attendance.service;

import com.company.hrms.model.dto.response.AttendanceResponseDto;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceResponseDto checkIn(Authentication authentication, MultipartFile image, String shiftCode);
    AttendanceResponseDto checkOut(Authentication authentication, MultipartFile image, String shiftCode);
    List<AttendanceResponseDto> getMyAttendances(Authentication authentication);
    List<AttendanceResponseDto> getAllAttendances(LocalDate startDate, LocalDate endDate);
}