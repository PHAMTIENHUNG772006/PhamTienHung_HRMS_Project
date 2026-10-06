package com.company.hrms.module.recruitment.controller;

import com.company.hrms.model.dto.request.RecruitmentRequestDto;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.RecruitmentResponseDto;
import com.company.hrms.module.recruitment.service.RecruitmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruitment")
@RequiredArgsConstructor
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecruitmentResponseDto>>> getAllCampaigns() {
        return ResponseEntity.ok(ApiResponse.<List<RecruitmentResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách chiến dịch thành công")
                .data(recruitmentService.getAllCampaigns())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecruitmentResponseDto>> createCampaign(@Valid @RequestBody RecruitmentRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<RecruitmentResponseDto>builder()
                .success(true)
                .message("Tạo chiến dịch thành công")
                .data(recruitmentService.createCampaign(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecruitmentResponseDto>> updateCampaign(@PathVariable Long id, @Valid @RequestBody RecruitmentRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<RecruitmentResponseDto>builder()
                .success(true)
                .message("Cập nhật chiến dịch thành công")
                .data(recruitmentService.updateCampaign(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCampaign(@PathVariable Long id) {
        recruitmentService.deleteCampaign(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa chiến dịch thành công")
                .build());
    }
}