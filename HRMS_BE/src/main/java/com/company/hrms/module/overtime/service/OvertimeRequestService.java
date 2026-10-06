package com.company.hrms.module.overtime.service;

import com.company.hrms.model.dto.request.OvertimeRequestDto;
import com.company.hrms.model.dto.response.OvertimeResponseDto;
import java.util.List;

public interface OvertimeRequestService {
    List<OvertimeResponseDto> getAllOvertimeRequests();
    OvertimeResponseDto createOvertimeRequest(OvertimeRequestDto request);
    OvertimeResponseDto updateOvertimeRequestStatus(Long id, String status, Float approvedHours);
    OvertimeResponseDto updateOvertimeRequest(Long id, OvertimeRequestDto request);
    void deleteOvertimeRequest(Long id);
}