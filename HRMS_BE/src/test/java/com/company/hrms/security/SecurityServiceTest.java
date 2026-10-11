package com.company.hrms.security;

import com.company.hrms.model.entity.Employee;
import com.company.hrms.model.entity.LeaveRequest;
import com.company.hrms.model.entity.Role;
import com.company.hrms.model.entity.User;
import com.company.hrms.module.auth.repository.UserRepository;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.leave.repository.LeaveRequestRepository;
import com.company.hrms.module.payroll.repository.PayrollRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SecurityServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private LeaveRequestRepository leaveRequestRepository;
    @Mock
    private PayrollRepository payrollRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SecurityService securityService;

    private User employeeUser;
    private Employee employeeEntity;

    @BeforeEach
    void setUp() {
        Role employeeRole = new Role();
        employeeRole.setRoleId(1L);
        employeeRole.setRoleName("EMPLOYEE");

        employeeUser = new User();
        employeeUser.setUserId(10L);
        employeeUser.setEmail("emp@company.com");
        employeeUser.setRole(employeeRole);

        employeeEntity = new Employee();
        employeeEntity.setEmployeeId(100L);
        employeeEntity.setUser(employeeUser);
    }

    @Test
    @DisplayName("Admin có toàn quyền truy cập hồ sơ nhân viên bất kỳ")
    void adminCanAccessAnyEmployee() {
        Authentication adminAuth = new UsernamePasswordAuthenticationToken(
                "admin@company.com", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        boolean result = securityService.canAccessEmployee(999L, adminAuth);
        assertTrue(result);
    }

    @Test
    @DisplayName("Nhân viên chỉ có quyền truy cập hồ sơ của chính mình")
    void employeeCanOnlyAccessOwnProfile() {
        Authentication empAuth = new UsernamePasswordAuthenticationToken(
                employeeUser, null, List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));

        when(employeeRepository.findByUserUserId(10L)).thenReturn(Optional.of(employeeEntity));

        // Truy cập hồ sơ của chính mình (ID 100) -> Cho phép
        assertTrue(securityService.canAccessEmployee(100L, empAuth));

        // Cố tình truy cập hồ sơ của nhân viên khác (ID 200) -> Từ chối
        assertFalse(securityService.canAccessEmployee(200L, empAuth));
    }

    @Test
    @DisplayName("Nhân viên không thể sửa đơn nghỉ phép của nhân viên khác")
    void employeeCannotModifyOtherEmployeeLeaveRequest() {
        Authentication empAuth = new UsernamePasswordAuthenticationToken(
                employeeUser, null, List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE")));

        when(employeeRepository.findByUserUserId(10L)).thenReturn(Optional.of(employeeEntity));

        // Đơn nghỉ phép thuộc về nhân viên ID 200
        Employee otherEmp = new Employee();
        otherEmp.setEmployeeId(200L);

        LeaveRequest otherLeave = new LeaveRequest();
        otherLeave.setLeaveRequestId(55L);
        otherLeave.setEmployee(otherEmp);

        when(leaveRequestRepository.findById(55L)).thenReturn(Optional.of(otherLeave));

        assertFalse(securityService.canModifyLeaveRequest(55L, empAuth));
    }
}
