package com.company.hrms.module.position.service;

import com.company.hrms.model.dto.request.PositionRequest;
import com.company.hrms.model.dto.response.PositionResponse;

import java.util.List;

public interface PositionService {
    List<PositionResponse> getAllPositions();
    PositionResponse getPositionById(Long id);
    PositionResponse createPosition(PositionRequest request);
    PositionResponse updatePosition(Long id, PositionRequest request);
    void deletePosition(Long id);
}