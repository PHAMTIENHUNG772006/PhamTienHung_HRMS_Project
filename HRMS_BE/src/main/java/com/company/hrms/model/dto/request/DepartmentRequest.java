package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentRequest {
    @NotBlank(message = "Mã phòng ban không được để trống")
    private String departmentCode;

    @NotBlank(message = "Tên phòng ban không được để trống")
    private String departmentName;

    private String description;

    private Long managerId;


    private Boolean active;
}