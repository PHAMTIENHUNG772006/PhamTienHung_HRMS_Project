package com.company.hrms.module.shift.service;

import com.company.hrms.model.dto.request.ShiftRequestDto;
import com.company.hrms.model.dto.response.ShiftResponseDto;
import java.util.List;

import java.time.LocalDate;

public interface ShiftService {
    List<ShiftResponseDto> getAllShifts();
    ShiftResponseDto createShift(ShiftRequestDto request);
    ShiftResponseDto updateShift(String code, ShiftRequestDto request);
    void deleteShift(String code);
    List<ShiftResponseDto> getShiftsByDate(LocalDate date);
}