package com.company.hrms.module.asset.service;

import com.company.hrms.model.dto.request.AssetRequestDto;
import com.company.hrms.model.dto.response.AssetResponseDto;
import java.util.List;

public interface AssetService {
    List<AssetResponseDto> getAllAssets();
    AssetResponseDto createAsset(AssetRequestDto request);
    AssetResponseDto updateAsset(Long id, AssetRequestDto request);
    void deleteAsset(Long id);
}