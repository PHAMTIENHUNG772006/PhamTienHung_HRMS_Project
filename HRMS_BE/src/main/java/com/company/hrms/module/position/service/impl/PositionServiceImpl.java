package com.company.hrms.module.position.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.PositionRequest;
import com.company.hrms.model.dto.response.PositionResponse;
import com.company.hrms.model.entity.Position;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.position.repository.PositionRepository;
import com.company.hrms.module.position.service.PositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PositionServiceImpl implements PositionService {

    private final PositionRepository positionRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PositionResponse> getAllPositions() {
        return positionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PositionResponse getPositionById(Long id) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new AppException("Chức vụ/Vị trí không tồn tại", HttpStatus.NOT_FOUND));
        return mapToResponse(position);
    }

    @Override
    @Transactional
    public PositionResponse createPosition(PositionRequest request) {
        Position position = new Position();
        mapRequestToEntity(request, position);
        return mapToResponse(positionRepository.save(position));
    }

    @Override
    @Transactional
    public PositionResponse updatePosition(Long id, PositionRequest request) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new AppException("Chức vụ/Vị trí không tồn tại", HttpStatus.NOT_FOUND));

        mapRequestToEntity(request, position);
        return mapToResponse(positionRepository.save(position));
    }

    @Override
    @Transactional
    public void deletePosition(Long id) {
        if (!positionRepository.existsById(id)) {
            throw new AppException("Chức vụ/Vị trí không tồn tại", HttpStatus.NOT_FOUND);
        }

        // Safe delete: Kiểm tra xem có nhân viên nào đang giữ chức vụ này không
        if (employeeRepository.existsByPositionPositionId(id)) {
            throw new AppException("Không thể xóa chức vụ này vì vẫn còn nhân viên đang đảm nhận.", HttpStatus.CONFLICT);
        }

        positionRepository.deleteById(id);
    }

    private void mapRequestToEntity(PositionRequest request, Position position) {
        position.setPositionName(request.getPositionName());
        position.setSalaryGrade(request.getSalaryGrade());
        
        if (request.getActive() != null) {
            position.setActive(request.getActive());
        }
    }

    private PositionResponse mapToResponse(Position position) {
        return PositionResponse.builder()
                .positionId(position.getPositionId())
                .positionName(position.getPositionName())
                .salaryGrade(position.getSalaryGrade())
                .active(position.getActive())
                .build();
    }
}