package com.company.hrms.module.auth.service;

import com.company.hrms.model.dto.request.UpdateUserRequest;
import com.company.hrms.model.dto.response.UserResponse;

import java.util.List;

public interface AccountService {
    List<UserResponse> getAllAccounts();
    List<UserResponse> getUnassignedAccounts();
    UserResponse getAccountById(Long id);
    UserResponse updateAccount(Long id, UpdateUserRequest request);
    void deleteAccount(Long id);
    void toggleAccountStatus(Long id);
}