package com.company.hrms.model.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class AttendanceRequestDto {
    private MultipartFile image;
    // Có thể thêm các trường khác như tọa độ GPS, địa chỉ WiFi...
}