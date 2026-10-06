package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RecruitmentRequestDto {
    @NotNull(message = "ID vị trí không được để trống")
    private Long positionId;

    @NotNull(message = "Số lượng không được để trống")
    private Integer quantityNeeded;

    @NotNull(message = "Hạn nộp hồ sơ không được để trống")
    private LocalDate deadline;

    private String description;
}