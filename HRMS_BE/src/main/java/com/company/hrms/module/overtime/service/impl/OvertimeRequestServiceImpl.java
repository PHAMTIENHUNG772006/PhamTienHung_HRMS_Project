package com.company.hrms.module.overtime.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.OvertimeRequestDto;
import com.company.hrms.model.dto.response.OvertimeResponseDto;
import com.company.hrms.model.entity.Employee;
import com.company.hrms.model.entity.OvertimeRequest;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.overtime.repository.OvertimeRequestRepository;
import com.company.hrms.module.overtime.service.OvertimeRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OvertimeRequestServiceImpl implements OvertimeRequestService {

    private final OvertimeRequestRepository overtimeRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OvertimeResponseDto> getAllOvertimeRequests() {
        return overtimeRepository.findAllWithEmployee().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OvertimeResponseDto createOvertimeRequest(OvertimeRequestDto request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException("Nhân viên không tồn tại", HttpStatus.NOT_FOUND));

        OvertimeRequest overtime = new OvertimeRequest();
        overtime.setEmployee(employee);
        overtime.setOtDate(request.getOtDate());
        overtime.setStartTime(request.getStartTime());
        overtime.setEndTime(request.getEndTime());
        overtime.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");

        return mapToDto(overtimeRepository.save(overtime));
    }

    @Override
    @Transactional
    public OvertimeResponseDto updateOvertimeRequestStatus(Long id, String status, Float approvedHours) {
        OvertimeRequest overtime = overtimeRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn OT", HttpStatus.NOT_FOUND));
        
        overtime.setStatus(status);
        if (approvedHours != null) {
            overtime.setApprovedHours(approvedHours);
        }

        return mapToDto(overtimeRepository.save(overtime));
    }

    @Override
    @Transactional
    public void deleteOvertimeRequest(Long id) {
        if (!overtimeRepository.existsById(id)) {
            throw new AppException("Không tìm thấy đơn OT", HttpStatus.NOT_FOUND);
        }
        overtimeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public OvertimeResponseDto updateOvertimeRequest(Long id, OvertimeRequestDto request) {
        OvertimeRequest overtime = overtimeRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn OT", HttpStatus.NOT_FOUND));

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException("Nhân viên không tồn tại", HttpStatus.NOT_FOUND));

        if (!"PENDING".equalsIgnoreCase(overtime.getStatus()) && !"Chờ duyệt".equalsIgnoreCase(overtime.getStatus())) {
            throw new AppException("Chỉ có thể chỉnh sửa đơn ở trạng thái chờ duyệt", HttpStatus.BAD_REQUEST);
        }

        overtime.setEmployee(employee);
        overtime.setOtDate(request.getOtDate());
        overtime.setStartTime(request.getStartTime());
        overtime.setEndTime(request.getEndTime());
        if (request.getStatus() != null) {
            overtime.setStatus(request.getStatus());
        }

        return mapToDto(overtimeRepository.save(overtime));
    }

    private OvertimeResponseDto mapToDto(OvertimeRequest overtime) {
        return OvertimeResponseDto.builder()
                .otRequestId(overtime.getOtRequestId())
                .employeeId(overtime.getEmployee() != null ? overtime.getEmployee().getEmployeeId() : null)
                .employeeName(overtime.getEmployee() != null ? overtime.getEmployee().getFullName() : null)
                .otDate(overtime.getOtDate())
                .startTime(overtime.getStartTime())
                .endTime(overtime.getEndTime())
                .approvedHours(overtime.getApprovedHours())
                .status(overtime.getStatus())
                .build();
    }
}