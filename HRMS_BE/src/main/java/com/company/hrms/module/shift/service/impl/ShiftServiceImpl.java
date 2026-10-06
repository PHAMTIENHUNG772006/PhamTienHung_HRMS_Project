package com.company.hrms.module.shift.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.ShiftRequestDto;
import com.company.hrms.model.dto.response.ShiftResponseDto;
import com.company.hrms.model.entity.Shift;
import com.company.hrms.module.shift.repository.ShiftRepository;
import com.company.hrms.module.shift.service.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {

    private final ShiftRepository shiftRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShiftResponseDto> getAllShifts() {
        return shiftRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShiftResponseDto> getShiftsByDate(LocalDate date) {
        return shiftRepository.findByShiftDate(date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShiftResponseDto createShift(ShiftRequestDto request) {
        if (shiftRepository.existsById(request.getShiftCode())) {
            throw new AppException("Ca làm việc với mã '" + request.getShiftCode() + "' đã tồn tại", HttpStatus.CONFLICT);
        }

        Shift shift = new Shift();
        shift.setShiftCode(request.getShiftCode());
        shift.setShiftName(request.getShiftName());
        shift.setShiftDate(request.getShiftDate());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setBreakDuration(request.getBreakDuration() != null ? request.getBreakDuration() : 0);

        return mapToDto(shiftRepository.save(shift));
    }

    @Override
    @Transactional
    public ShiftResponseDto updateShift(String code, ShiftRequestDto request) {
        Shift shift = shiftRepository.findById(code)
                .orElseThrow(() -> new AppException("Ca làm việc không tồn tại", HttpStatus.NOT_FOUND));

        if (!code.equalsIgnoreCase(request.getShiftCode()) && shiftRepository.existsById(request.getShiftCode())) {
            throw new AppException("Ca làm việc với mã '" + request.getShiftCode() + "' đã tồn tại", HttpStatus.CONFLICT);
        }

        if (!code.equals(request.getShiftCode())) {
            shiftRepository.delete(shift);
            Shift newShift = new Shift();
            newShift.setShiftCode(request.getShiftCode());
            newShift.setShiftName(request.getShiftName());
            newShift.setShiftDate(request.getShiftDate());
            newShift.setStartTime(request.getStartTime());
            newShift.setEndTime(request.getEndTime());
            newShift.setBreakDuration(request.getBreakDuration() != null ? request.getBreakDuration() : 0);
            return mapToDto(shiftRepository.save(newShift));
        } else {
            shift.setShiftName(request.getShiftName());
            shift.setShiftDate(request.getShiftDate());
            shift.setStartTime(request.getStartTime());
            shift.setEndTime(request.getEndTime());
            shift.setBreakDuration(request.getBreakDuration() != null ? request.getBreakDuration() : 0);
            return mapToDto(shiftRepository.save(shift));
        }
    }

    @Override
    @Transactional
    public void deleteShift(String code) {
        if (!shiftRepository.existsById(code)) {
            throw new AppException("Ca làm việc không tồn tại", HttpStatus.NOT_FOUND);
        }
        shiftRepository.deleteById(code);
    }

    private ShiftResponseDto mapToDto(Shift shift) {
        return ShiftResponseDto.builder()
                .shiftCode(shift.getShiftCode())
                .shiftName(shift.getShiftName())
                .shiftDate(shift.getShiftDate())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .breakDuration(shift.getBreakDuration())
                .build();
    }
}