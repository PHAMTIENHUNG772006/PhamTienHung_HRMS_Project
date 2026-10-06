package com.company.hrms.module.recruitment.service;

import com.company.hrms.model.dto.request.CandidateApproveDto;
import com.company.hrms.model.dto.request.CandidateRequestDto;
import com.company.hrms.model.dto.response.CandidateResponseDto;

import java.util.List;

public interface CandidateService {
    List<CandidateResponseDto> getAllCandidates();
    CandidateResponseDto createCandidate(CandidateRequestDto request);
    CandidateResponseDto approveCandidate(Long id, CandidateApproveDto request);
}
