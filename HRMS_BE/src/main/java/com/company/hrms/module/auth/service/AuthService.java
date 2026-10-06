package com.company.hrms.module.auth.service;

import com.company.hrms.model.dto.request.ChangePasswordRequest;
import com.company.hrms.model.dto.request.LoginRequest;
import com.company.hrms.model.dto.request.RegisterRequest;
import com.company.hrms.model.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    void changePassword(String email, ChangePasswordRequest request);
}