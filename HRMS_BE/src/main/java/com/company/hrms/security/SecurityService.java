package com.company.hrms.security;

import com.company.hrms.model.entity.Employee;
import com.company.hrms.model.entity.LeaveRequest;
import com.company.hrms.model.entity.Payroll;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.leave.repository.LeaveRequestRepository;
import com.company.hrms.module.payroll.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("securityService")
@RequiredArgsConstructor
@Slf4j
public class SecurityService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRepository payrollRepository;
    private final com.company.hrms.module.auth.repository.UserRepository userRepository;

    public Optional<User> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return Optional.of((User) principal);
        } else if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email);
        } else if (principal instanceof String) {
            return userRepository.findByEmail((String) principal);
        }
        return Optional.empty();
    }

    public Optional<Employee> getCurrentEmployee(Authentication authentication) {
        return getCurrentUser(authentication)
                .flatMap(u -> employeeRepository.findByUserUserId(u.getUserId()));
    }

    public Long getCurrentEmployeeId(Authentication authentication) {
        return getCurrentEmployee(authentication)
                .map(Employee::getEmployeeId)
                .orElse(null);
    }

    public boolean hasRole(Authentication authentication, String... roles) {
        if (authentication == null) return false;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String authName = authority.getAuthority();
            for (String role : roles) {
                if (authName.equals("ROLE_" + role) || authName.equals(role)) {
                    return true;
                }
            }
        }
        return false;
    }

    public boolean isHrOrAdmin(Authentication authentication) {
        return hasRole(authentication, "ADMIN", "HR");
    }

    public boolean isManagerOrAbove(Authentication authentication) {
        return hasRole(authentication, "ADMIN", "HR", "MANAGER");
    }

    public boolean isCurrentEmployee(Long employeeId, Authentication authentication) {
        if (employeeId == null) return false;
        Long currentEmpId = getCurrentEmployeeId(authentication);
        return employeeId.equals(currentEmpId);
    }

    /**
     * Kiểm tra quyền xem/sửa hồ sơ nhân viên:
     * ADMIN/HR xem được tất cả; Nhân viên chỉ được xem hồ sơ của chính mình.
     */
    public boolean canAccessEmployee(Long employeeId, Authentication authentication) {
        if (isHrOrAdmin(authentication)) {
            return true;
        }
        return isCurrentEmployee(employeeId, authentication);
    }

    /**
     * Kiểm tra quyền sửa/xóa đơn nghỉ phép:
     * ADMIN/HR hoặc chính chủ sở hữu đơn mới có quyền.
     */
    public boolean canModifyLeaveRequest(Long leaveRequestId, Authentication authentication) {
        if (isHrOrAdmin(authentication)) {
            return true;
        }
        Long currentEmpId = getCurrentEmployeeId(authentication);
        if (currentEmpId == null) {
            return false;
        }
        return leaveRequestRepository.findById(leaveRequestId)
                .map(lr -> lr.getEmployee() != null && currentEmpId.equals(lr.getEmployee().getEmployeeId()))
                .orElse(false);
    }

    /**
     * Kiểm tra quyền tạo đơn nghỉ phép cho employeeId:
     * ADMIN/HR có thể tạo hộ; Nhân viên thông thường chỉ được tạo cho chính mình.
     */
    public boolean canCreateLeaveRequest(Long employeeId, Authentication authentication) {
        if (isHrOrAdmin(authentication)) {
            return true;
        }
        return isCurrentEmployee(employeeId, authentication);
    }

    /**
     * Kiểm tra quyền xem chi tiết bảng lương:
     * ADMIN/HR/PAYROLL xem được tất cả; Nhân viên chỉ được xem bảng lương của chính mình.
     */
    public boolean canAccessPayroll(Long payrollId, Authentication authentication) {
        if (hasRole(authentication, "ADMIN", "PAYROLL", "HR")) {
            return true;
        }
        Long currentEmpId = getCurrentEmployeeId(authentication);
        if (currentEmpId == null) {
            return false;
        }
        return payrollRepository.findById(payrollId)
                .map(p -> p.getEmployee() != null && currentEmpId.equals(p.getEmployee().getEmployeeId()))
                .orElse(false);
    }
}
