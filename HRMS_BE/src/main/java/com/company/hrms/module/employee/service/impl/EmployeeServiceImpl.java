package com.company.hrms.module.employee.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.EmployeeRequest;
import com.company.hrms.model.dto.response.EmployeeResponse;
import com.company.hrms.model.entity.Department;
import com.company.hrms.model.entity.Employee;
import com.company.hrms.model.entity.Position;
import com.company.hrms.model.entity.Role;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.auth.repository.RoleRepository;
import com.company.hrms.module.auth.repository.UserRepository;
import com.company.hrms.module.department.repository.DepartmentRepository;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.employee.service.EmployeeService;
import com.company.hrms.module.position.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy nhân viên", HttpStatus.NOT_FOUND));
        return mapToResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (request.getIdCardNumber() != null) {
            String cccdStr = String.valueOf(request.getIdCardNumber());
            if (cccdStr.length() != 12) {
                throw new AppException("Số CCCD (Căn cước công dân) phải bao gồm đúng 12 chữ số", HttpStatus.BAD_REQUEST);
            }
        }

        if (employeeRepository.existsByIdCardNumber(request.getIdCardNumber())) {
            throw new AppException("Số CCCD đã tồn tại trong hệ thống", HttpStatus.CONFLICT);
        }

        Employee employee = new Employee();
        mapRequestToEntity(request, employee);
        
        return mapToResponse(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy nhân viên", HttpStatus.NOT_FOUND));

        if (request.getIdCardNumber() != null) {
            String cccdStr = String.valueOf(request.getIdCardNumber());
            if (cccdStr.length() != 12) {
                throw new AppException("Số CCCD (Căn cước công dân) phải bao gồm đúng 12 chữ số", HttpStatus.BAD_REQUEST);
            }
        }

        if (!employee.getIdCardNumber().equals(request.getIdCardNumber()) && 
            employeeRepository.existsByIdCardNumber(request.getIdCardNumber())) {
            throw new AppException("Số CCCD đã tồn tại trong hệ thống", HttpStatus.CONFLICT);
        }

        mapRequestToEntity(request, employee);
        
        return mapToResponse(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new AppException("Không tìm thấy nhân viên", HttpStatus.NOT_FOUND);
        }
        employeeRepository.deleteById(id);
    }

    private void mapRequestToEntity(EmployeeRequest request, Employee employee) {
        employee.setFullName(request.getFullName());
        employee.setIdCardNumber(request.getIdCardNumber());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setStatus(request.getStatus());
        employee.setBasicSalary(request.getBasicSalary());

        if (request.getUserId() != null) {
            employeeRepository.findByUserUserId(request.getUserId()).ifPresent(existingEmp -> {
                if (employee.getEmployeeId() == null || !existingEmp.getEmployeeId().equals(employee.getEmployeeId())) {
                    throw new AppException("Tài khoản này đã được gán cho một nhân viên khác", HttpStatus.CONFLICT);
                }
            });

            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new AppException("Không tìm thấy user", HttpStatus.NOT_FOUND));
            
            if ("CANDIDATE".equals(user.getRole().getRoleName())) {
                Role empRole = roleRepository.findByRoleName("EMPLOYEE")
                    .orElseThrow(() -> new AppException("Role EMPLOYEE không tồn tại", HttpStatus.INTERNAL_SERVER_ERROR));
                user.setRole(empRole);
                user.setStatus("ACTIVE");
            }
            
            user.setBankAccountNumber(request.getBankAccountNumber());
            userRepository.save(user);
            employee.setUser(user);
        } else {
            String baseUsername = request.getFullName().replaceAll("\\s+","").toLowerCase();
            String generatedUsername = baseUsername;
            int counter = 1;
            while(userRepository.existsByUsername(generatedUsername)){
                 generatedUsername = baseUsername + counter;
                 counter++;
            }
            String generatedEmail = generatedUsername + "@company.com";
            
            String tempPassword = "Password@123";

            Role empRole = roleRepository.findByRoleName("EMPLOYEE")
                    .orElseThrow(() -> new AppException("Role EMPLOYEE không tồn tại", HttpStatus.INTERNAL_SERVER_ERROR));
            
            User newUser = new User();
            newUser.setUsername(generatedUsername);
            newUser.setEmail(generatedEmail);
            newUser.setPasswordHash(passwordEncoder.encode(tempPassword));
            newUser.setRole(empRole);
            newUser.setStatus("ACTIVE");
            newUser.setIsTemporaryPassword(true);
            newUser.setBankAccountNumber(request.getBankAccountNumber());

            User savedUser = userRepository.save(newUser);
            employee.setUser(savedUser);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException("Phòng ban không tồn tại", HttpStatus.NOT_FOUND));
            employee.setDepartment(department);
        }

        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new AppException("Chức vụ không tồn tại", HttpStatus.NOT_FOUND));
            employee.setPosition(position);
        }
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        return EmployeeResponse.builder()
                .employeeId(employee.getEmployeeId())
                .userId(employee.getUser() != null ? employee.getUser().getUserId() : null)
                .fullName(employee.getFullName())
                .idCardNumber(employee.getIdCardNumber())
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getDepartmentId() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : null)
                .positionId(employee.getPosition() != null ? employee.getPosition().getPositionId() : null)
                .positionName(employee.getPosition() != null ? employee.getPosition().getPositionName() : null)
                .joiningDate(employee.getJoiningDate())
                .status(employee.getStatus())
                .bankAccountNumber(employee.getUser() != null ? employee.getUser().getBankAccountNumber() : null)
                .basicSalary(employee.getBasicSalary())
                .build();
    }
}