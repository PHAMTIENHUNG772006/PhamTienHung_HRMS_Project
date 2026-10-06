package com.company.hrms.module.auth.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.UpdateUserRequest;
import com.company.hrms.model.dto.response.UserResponse;
import com.company.hrms.model.entity.Role;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.auth.repository.RoleRepository;
import com.company.hrms.module.auth.repository.UserRepository;
import com.company.hrms.module.auth.service.AccountService;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllAccounts() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUnassignedAccounts() {
        // Lấy tất cả user mà chưa được gán cho bất kỳ nhân viên nào
        return userRepository.findAll().stream()
                .filter(user -> employeeRepository.findByUserUserId(user.getUserId()).isEmpty())
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getAccountById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateAccount(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        if (request.getRoleName() != null) {
            Role role = roleRepository.findByRoleName(request.getRoleName())
                    .orElseThrow(() -> new AppException("Role not found", HttpStatus.NOT_FOUND));
            user.setRole(role);
        }

        return mapToUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteAccount(Long id) {
        if (!userRepository.existsById(id)) {
            throw new AppException("User not found", HttpStatus.NOT_FOUND);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleAccountStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        
        if ("ACTIVE".equals(user.getStatus())) {
            user.setStatus("INACTIVE");
        } else {
            user.setStatus("ACTIVE");
        }
        
        userRepository.save(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getActualUsername())
                .email(user.getEmail())
                .role(user.getRole().getRoleName())
                .status(user.getStatus())
                .isTemporaryPassword(user.getIsTemporaryPassword())
                .build();
    }
}