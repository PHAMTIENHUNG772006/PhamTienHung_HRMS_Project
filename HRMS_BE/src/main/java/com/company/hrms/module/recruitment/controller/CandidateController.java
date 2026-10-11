package com.company.hrms.module.recruitment.controller;

import com.company.hrms.model.dto.request.CandidateApproveDto;
import com.company.hrms.model.dto.request.CandidateRequestDto;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.CandidateResponseDto;
import com.company.hrms.module.recruitment.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<CandidateResponseDto>>> getAllCandidates() {
        return ResponseEntity.ok(ApiResponse.<List<CandidateResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách ứng viên thành công")
                .data(candidateService.getAllCandidates())
                .build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateResponseDto>> createCandidate(@Valid @RequestBody CandidateRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<CandidateResponseDto>builder()
                .success(true)
                .message("Tạo ứng viên thành công")
                .data(candidateService.createCandidate(request))
                .build());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<CandidateResponseDto>> approveCandidate(@PathVariable Long id, @Valid @RequestBody CandidateApproveDto request) {
        return ResponseEntity.ok(ApiResponse.<CandidateResponseDto>builder()
                .success(true)
                .message("Phê duyệt ứng viên thành công")
                .data(candidateService.approveCandidate(id, request))
                .build());
    }
}
