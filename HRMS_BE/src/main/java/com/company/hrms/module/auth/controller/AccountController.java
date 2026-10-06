package com.company.hrms.module.auth.controller;

import com.company.hrms.model.dto.request.UpdateUserRequest;
import com.company.hrms.model.dto.response.ApiResponse;
import com.company.hrms.model.dto.response.UserResponse;
import com.company.hrms.module.auth.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllAccounts() {
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Accounts fetched successfully")
                .data(accountService.getAllAccounts())
                .build());
    }

    @GetMapping("/unassigned")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUnassignedAccounts() {
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Lấy danh sách tài khoản chưa được gán thành công")
                .data(accountService.getUnassignedAccounts())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getAccountById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Account fetched successfully")
                .data(accountService.getAccountById(id))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateAccount(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("Account updated successfully")
                .data(accountService.updateAccount(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Account deleted successfully")
                .build());
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        accountService.toggleAccountStatus(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Account status toggled successfully")
                .build());
    }
}