package com.company.hrms.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Mật khẩu cũ không được để trống")
    private String oldPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @jakarta.validation.constraints.Size(min = 6, max = 100, message = "Mật khẩu mới phải có từ 6 đến 100 ký tự")
    private String newPassword;
}