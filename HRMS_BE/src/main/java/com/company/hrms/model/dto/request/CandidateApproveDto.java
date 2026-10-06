package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CandidateApproveDto {
    @NotBlank(message = "Mã nhân viên không được để trống")
    private String employeeCode;

    @NotNull(message = "Phòng ban không được để trống")
    private Long departmentId;

    @NotNull(message = "Chức vụ không được để trống")
    private Long positionId;

    @NotBlank(message = "Quyền hạn không được để trống")
    private String roleName;

    @NotBlank(message = "Trạng thái làm việc không được để trống")
    private String status;

    private Long idCardNumber;
}
