package com.company.hrms.module.shift.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.ShiftAssignmentRequestDto;
import com.company.hrms.model.dto.response.ShiftAssignmentResponseDto;
import com.company.hrms.model.entity.Employee;
import com.company.hrms.model.entity.Shift;
import com.company.hrms.model.entity.ShiftAssignment;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.shift.repository.ShiftAssignmentRepository;
import com.company.hrms.module.shift.repository.ShiftRepository;
import com.company.hrms.module.shift.service.ShiftAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftAssignmentServiceImpl implements ShiftAssignmentService {

    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final ShiftRepository shiftRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShiftAssignmentResponseDto> getShiftAssignmentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return shiftAssignmentRepository.findByDateRangeWithDetails(startDate, endDate).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void createShiftAssignments(ShiftAssignmentRequestDto request) {
        if (request.getFromDate().isAfter(request.getToDate())) {
            throw new AppException("Ngày bắt đầu không được sau ngày kết thúc", HttpStatus.BAD_REQUEST);
        }

        // 1. Lấy ra khuôn mẫu ca làm việc từ shiftCode
        Shift shift = shiftRepository.findById(request.getShiftCode())
                .orElseThrow(() -> new AppException("Ca làm việc '" + request.getShiftCode() + "' không tồn tại", HttpStatus.NOT_FOUND));

        List<ShiftAssignment> assignmentsToSave = new ArrayList<>();

        // 2. Lặp qua từng nhân viên được chọn
        for (Long employeeId : request.getEmployeeIds()) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new AppException("Nhân viên có ID " + employeeId + " không tồn tại", HttpStatus.NOT_FOUND));

            // 3. Lặp qua từng ngày trong khoảng thời gian để tạo/cập nhật bản ghi phân công
            LocalDate currentDate = request.getFromDate();
            while (!currentDate.isAfter(request.getToDate())) {
                
                Optional<ShiftAssignment> existingAssignment = shiftAssignmentRepository.findByEmployeeEmployeeIdAndAssignDate(employeeId, currentDate);
                
                ShiftAssignment sa;
                if (existingAssignment.isPresent()) {
                    // Nếu đã có phân ca trong ngày -> Cập nhật lại ca mới
                    sa = existingAssignment.get();
                    sa.setShift(shift);
                } else {
                    // Nếu chưa có -> Tạo mới
                    sa = new ShiftAssignment();
                    sa.setEmployee(employee);
                    sa.setShift(shift);
                    sa.setAssignDate(currentDate);
                }
                assignmentsToSave.add(sa);

                currentDate = currentDate.plusDays(1);
            }
        }

        // 4. Lưu tất cả vào DB trong một lần
        shiftAssignmentRepository.saveAll(assignmentsToSave);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShiftAssignmentResponseDto> getMyShiftAssignmentsToday() {
        Employee employee = getEmployeeFromAuthentication();
        return shiftAssignmentRepository.findByEmployeeEmployeeIdAndAssignDate(employee.getEmployeeId(), LocalDate.now()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteShiftAssignment(Long id) {
        if (!shiftAssignmentRepository.existsById(id)) {
            throw new AppException("Không tìm thấy phân ca làm việc để xóa", HttpStatus.NOT_FOUND);
        }
        shiftAssignmentRepository.deleteById(id);
    }

    private Employee getEmployeeFromAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AppException("Chưa xác thực người dùng", HttpStatus.UNAUTHORIZED);
        }
        
        Object principal = authentication.getPrincipal();
        Long userId;
        if (principal instanceof User) {
             userId = ((User) principal).getUserId();
        } else {
             throw new AppException("Lỗi định dạng xác thực", HttpStatus.UNAUTHORIZED);
        }
        
        return employeeRepository.findByUserUserId(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ nhân viên cho tài khoản này", HttpStatus.NOT_FOUND));
    }

    private ShiftAssignmentResponseDto mapToDto(ShiftAssignment sa) {
        return ShiftAssignmentResponseDto.builder()
                .assignmentId(sa.getAssignmentId())
                .employeeId(sa.getEmployee() != null ? sa.getEmployee().getEmployeeId() : null)
                .employeeName(sa.getEmployee() != null ? sa.getEmployee().getFullName() : null)
                .shiftCode(sa.getShift() != null ? sa.getShift().getShiftCode() : null)
                .shiftName(sa.getShift() != null ? sa.getShift().getShiftName() : null)
                .startTime(sa.getShift() != null ? sa.getShift().getStartTime() : null)
                .endTime(sa.getShift() != null ? sa.getShift().getEndTime() : null)
                .assignDate(sa.getAssignDate())
                .build();
    }
}