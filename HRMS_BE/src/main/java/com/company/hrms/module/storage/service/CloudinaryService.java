package com.company.hrms.module.storage.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.company.hrms.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList("image/jpeg", "image/png", "image/gif");

    /**
     * Uploads a file to a specific folder in Cloudinary.
     *
     * @param file   The file to upload.
     * @param folder The target folder in Cloudinary (e.g., "hrms/attendances").
     * @return The URL of the uploaded file.
     */
    public String uploadFile(MultipartFile file, String folder) {
        // 1. Validate file
        if (file == null || file.isEmpty()) {
            // Không ném lỗi mà trả về null để logic nghiệp vụ có thể bỏ qua việc upload
            return null; 
        }
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new AppException("Chỉ cho phép upload file ảnh (JPEG, PNG, GIF)", HttpStatus.BAD_REQUEST);
        }

        try {
            // 2. Build upload options with folder
            Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image"
            );

            // 3. Upload file
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            
            // 4. Return the secure URL
            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            throw new AppException("Lỗi khi upload file lên Cloudinary: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}