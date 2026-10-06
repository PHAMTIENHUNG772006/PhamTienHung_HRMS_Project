package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PositionRequest {
    @NotBlank(message = "Tên chức vụ không được để trống")
    private String positionName;

    @NotBlank(message = "Bậc lương không được để trống")
    private String salaryGrade;

    private Boolean active;
}