package com.company.hrms.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssetResponseDto {
    private Long assetId;
    private String assetName;
    private String assetType;
    private String status;
}