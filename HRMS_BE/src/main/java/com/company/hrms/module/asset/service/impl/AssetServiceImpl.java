package com.company.hrms.module.asset.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.AssetRequestDto;
import com.company.hrms.model.dto.response.AssetResponseDto;
import com.company.hrms.model.entity.Asset;
import com.company.hrms.module.asset.repository.AssetRepository;
import com.company.hrms.module.asset.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponseDto> getAllAssets() {
        return assetRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AssetResponseDto createAsset(AssetRequestDto request) {
        Asset asset = new Asset();
        asset.setAssetName(request.getAssetName());
        asset.setAssetType(request.getAssetType());
        asset.setStatus(request.getStatus());
        return mapToDto(assetRepository.save(asset));
    }

    @Override
    @Transactional
    public AssetResponseDto updateAsset(Long id, AssetRequestDto request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new AppException("Tài sản không tồn tại", HttpStatus.NOT_FOUND));

        asset.setAssetName(request.getAssetName());
        asset.setAssetType(request.getAssetType());
        asset.setStatus(request.getStatus());
        return mapToDto(assetRepository.save(asset));
    }

    @Override
    @Transactional
    public void deleteAsset(Long id) {
        if (!assetRepository.existsById(id)) {
            throw new AppException("Tài sản không tồn tại", HttpStatus.NOT_FOUND);
        }
        assetRepository.deleteById(id);
    }

    private AssetResponseDto mapToDto(Asset asset) {
        return AssetResponseDto.builder()
                .assetId(asset.getAssetId())
                .assetName(asset.getAssetName())
                .assetType(asset.getAssetType())
                .status(asset.getStatus())
                .build();
    }
}