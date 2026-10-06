package com.company.hrms.module.leave.service;

import com.company.hrms.model.dto.request.LeaveRequestDto;
import com.company.hrms.model.dto.response.LeaveResponseDto;
import java.util.List;

public interface LeaveRequestService {
    List<LeaveResponseDto> getAllLeaveRequests();
    LeaveResponseDto getLeaveRequestById(Long id);
    LeaveResponseDto createLeaveRequest(LeaveRequestDto request);
    LeaveResponseDto updateLeaveRequestStatus(Long id, String status);
    LeaveResponseDto updateLeaveRequest(Long id, LeaveRequestDto request);
    void deleteLeaveRequest(Long id);
}