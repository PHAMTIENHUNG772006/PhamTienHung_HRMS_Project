package com.company.hrms.model.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class RecruitmentResponseDto {
    private Long campaignId;
    private Long positionId;
    private String positionName;
    private Integer quantityNeeded;
    private LocalDate deadline;
    private String description;
}