package com.company.hrms.module.shift.service;

import com.company.hrms.model.dto.request.ShiftAssignmentRequestDto;
import com.company.hrms.model.dto.response.ShiftAssignmentResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface ShiftAssignmentService {
    List<ShiftAssignmentResponseDto> getShiftAssignmentsByDateRange(LocalDate startDate, LocalDate endDate);
    void createShiftAssignments(ShiftAssignmentRequestDto request);
    List<ShiftAssignmentResponseDto> getMyShiftAssignmentsToday();
    void deleteShiftAssignment(Long id);
}