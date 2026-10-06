package com.company.hrms.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateResponseDto {
    private Long candidateId;
    private Long campaignId;
    private String positionName;
    private String candidateName;
    private String email;
    private String cvFileUrl;
    private String source;
    private String status;
}
