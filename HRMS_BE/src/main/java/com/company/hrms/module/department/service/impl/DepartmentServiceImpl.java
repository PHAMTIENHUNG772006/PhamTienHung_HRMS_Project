package com.company.hrms.module.department.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.DepartmentRequest;
import com.company.hrms.model.dto.response.DepartmentResponse;
import com.company.hrms.model.entity.Department;
import com.company.hrms.model.entity.Employee;
import com.company.hrms.module.department.repository.DepartmentRepository;
import com.company.hrms.module.department.service.DepartmentService;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy phòng ban", HttpStatus.NOT_FOUND));
        return mapToResponse(department);
    }

    @Override
    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        // Kiểm tra trùng mã phòng ban
        if (departmentRepository.findAll().stream().anyMatch(d -> d.getDepartmentCode().equalsIgnoreCase(request.getDepartmentCode()))) {
            throw new AppException("Mã phòng ban đã tồn tại trong hệ thống", HttpStatus.CONFLICT);
        }

        Department department = new Department();
        mapRequestToEntity(request, department);
        return mapToResponse(departmentRepository.save(department));
    }

    @Override
    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy phòng ban", HttpStatus.NOT_FOUND));

        // Kiểm tra trùng mã phòng ban khi đổi mã
        if (!department.getDepartmentCode().equalsIgnoreCase(request.getDepartmentCode()) &&
            departmentRepository.findAll().stream().anyMatch(d -> d.getDepartmentCode().equalsIgnoreCase(request.getDepartmentCode()))) {
            throw new AppException("Mã phòng ban đã tồn tại trong hệ thống", HttpStatus.CONFLICT);
        }

        mapRequestToEntity(request, department);
        return mapToResponse(departmentRepository.save(department));
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new AppException("Không tìm thấy phòng ban", HttpStatus.NOT_FOUND);
        }

        boolean hasEmployees = employeeRepository.findAll().stream()
                .anyMatch(e -> e.getDepartment() != null && e.getDepartment().getDepartmentId().equals(id));
        if (hasEmployees) {
            throw new AppException("Không thể xóa phòng ban đang có nhân viên trực thuộc", HttpStatus.CONFLICT);
        }

        departmentRepository.deleteById(id);
    }

    private void mapRequestToEntity(DepartmentRequest request, Department department) {
        department.setDepartmentCode(request.getDepartmentCode());
        department.setDepartmentName(request.getDepartmentName());
        department.setDescription(request.getDescription());
        department.setActive(request.getActive() != null ? request.getActive() : true);

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new AppException("Không tìm thấy nhân viên quản lý", HttpStatus.NOT_FOUND));
            department.setManager(manager);
        } else {
            department.setManager(null);
        }
    }

    private DepartmentResponse mapToResponse(Department department) {
        return DepartmentResponse.builder()
                .departmentId(department.getDepartmentId())
                .departmentCode(department.getDepartmentCode())
                .departmentName(department.getDepartmentName())
                .description(department.getDescription())
                .managerId(department.getManager() != null ? department.getManager().getEmployeeId() : null)
                .managerName(department.getManager() != null ? department.getManager().getFullName() : null)
                .active(department.getActive())
                .build();
    }
}