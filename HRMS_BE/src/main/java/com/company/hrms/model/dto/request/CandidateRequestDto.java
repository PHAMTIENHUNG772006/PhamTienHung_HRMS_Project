package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CandidateRequestDto {
    @NotBlank(message = "Tên ứng viên không được để trống")
    private String candidateName;

    @NotNull(message = "ID chiến dịch không được để trống")
    private Long campaignId;

    private String email;

    @NotBlank(message = "Link CV không được để trống")
    private String cvFileUrl;

    private String source;

    private String status;
}
