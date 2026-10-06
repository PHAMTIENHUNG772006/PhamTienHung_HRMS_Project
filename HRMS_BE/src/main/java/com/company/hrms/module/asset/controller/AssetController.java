package com.company.hrms.module.asset.controller;

import com.company.hrms.model.dto.request.AssetRequestDto;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.AssetResponseDto;
import com.company.hrms.module.asset.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetResponseDto>>> getAllAssets() {
        return ResponseEntity.ok(ApiResponse.<List<AssetResponseDto>>builder()
                .success(true)
                .message("Lấy danh sách tài sản thành công")
                .data(assetService.getAllAssets())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssetResponseDto>> createAsset(@Valid @RequestBody AssetRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<AssetResponseDto>builder()
                .success(true)
                .message("Tạo tài sản thành công")
                .data(assetService.createAsset(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetResponseDto>> updateAsset(@PathVariable Long id, @Valid @RequestBody AssetRequestDto request) {
        return ResponseEntity.ok(ApiResponse.<AssetResponseDto>builder()
                .success(true)
                .message("Cập nhật tài sản thành công")
                .data(assetService.updateAsset(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa tài sản thành công")
                .build());
    }
}