package com.company.hrms.module.position.controller;

import com.company.hrms.model.dto.request.PositionRequest;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.PositionResponse;
import com.company.hrms.module.position.service.PositionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PositionResponse>>> getAllPositions() {
        return ResponseEntity.ok(ApiResponse.<List<PositionResponse>>builder()
                .success(true)
                .message("Lấy danh sách chức vụ thành công")
                .data(positionService.getAllPositions())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionResponse>> getPositionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<PositionResponse>builder()
                .success(true)
                .message("Lấy thông tin chức vụ thành công")
                .data(positionService.getPositionById(id))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PositionResponse>> createPosition(@Valid @RequestBody PositionRequest request) {
        return ResponseEntity.ok(ApiResponse.<PositionResponse>builder()
                .success(true)
                .message("Tạo chức vụ thành công")
                .data(positionService.createPosition(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionResponse>> updatePosition(@PathVariable Long id, @Valid @RequestBody PositionRequest request) {
        return ResponseEntity.ok(ApiResponse.<PositionResponse>builder()
                .success(true)
                .message("Cập nhật chức vụ thành công")
                .data(positionService.updatePosition(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePosition(@PathVariable Long id) {
        positionService.deletePosition(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Xóa chức vụ thành công")
                .build());
    }
}