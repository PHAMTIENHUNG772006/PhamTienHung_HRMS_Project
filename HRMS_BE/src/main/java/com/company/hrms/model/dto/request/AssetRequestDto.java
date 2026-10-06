package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssetRequestDto {
    @NotBlank(message = "Tên tài sản không được để trống")
    private String assetName;

    @NotBlank(message = "Loại tài sản không được để trống")
    private String assetType;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}