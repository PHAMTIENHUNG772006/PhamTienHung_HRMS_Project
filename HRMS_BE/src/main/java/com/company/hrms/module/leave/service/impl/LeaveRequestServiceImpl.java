package com.company.hrms.module.leave.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.LeaveRequestDto;
import com.company.hrms.model.dto.response.LeaveResponseDto;
import com.company.hrms.model.entity.Employee;
import com.company.hrms.model.entity.LeaveRequest;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.leave.repository.LeaveRequestRepository;
import com.company.hrms.module.leave.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponseDto> getAllLeaveRequests() {
        return leaveRequestRepository.findAllWithEmployee().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveResponseDto getLeaveRequestById(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn xin nghỉ phép", HttpStatus.NOT_FOUND));
        return mapToDto(leaveRequest);
    }

    @Override
    @Transactional
    public LeaveResponseDto createLeaveRequest(LeaveRequestDto request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException("Ngày kết thúc không được trước ngày bắt đầu", HttpStatus.BAD_REQUEST);
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException("Nhân viên không tồn tại", HttpStatus.NOT_FOUND));

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(request.getLeaveType());
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setTotalDays(request.getTotalDays());
        leaveRequest.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");

        return mapToDto(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    @Transactional
    public LeaveResponseDto updateLeaveRequest(Long id, LeaveRequestDto request) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn xin nghỉ phép", HttpStatus.NOT_FOUND));

        if (!"PENDING".equalsIgnoreCase(leaveRequest.getStatus())) {
            throw new AppException("Chỉ có thể sửa đơn khi ở trạng thái 'Chờ duyệt'", HttpStatus.FORBIDDEN);
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException("Ngày kết thúc không được trước ngày bắt đầu", HttpStatus.BAD_REQUEST);
        }

        leaveRequest.setLeaveType(request.getLeaveType());
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setTotalDays(request.getTotalDays());

        return mapToDto(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    @Transactional
    public LeaveResponseDto updateLeaveRequestStatus(Long id, String status) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn xin nghỉ phép", HttpStatus.NOT_FOUND));
        leaveRequest.setStatus(status);
        return mapToDto(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    @Transactional
    public void deleteLeaveRequest(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn xin nghỉ phép", HttpStatus.NOT_FOUND));

        if (!"PENDING".equalsIgnoreCase(leaveRequest.getStatus())) {
            throw new AppException("Chỉ có thể xóa đơn khi ở trạng thái 'Chờ duyệt'", HttpStatus.FORBIDDEN);
        }

        leaveRequestRepository.delete(leaveRequest);
    }

    private LeaveResponseDto mapToDto(LeaveRequest leaveRequest) {
        return LeaveResponseDto.builder()
                .leaveRequestId(leaveRequest.getLeaveRequestId())
                .employeeId(leaveRequest.getEmployee() != null ? leaveRequest.getEmployee().getEmployeeId() : null)
                .employeeName(leaveRequest.getEmployee() != null ? leaveRequest.getEmployee().getFullName() : null)
                .leaveType(leaveRequest.getLeaveType())
                .startDate(leaveRequest.getStartDate())
                .endDate(leaveRequest.getEndDate())
                .totalDays(leaveRequest.getTotalDays())
                .status(leaveRequest.getStatus())
                .build();
    }
}