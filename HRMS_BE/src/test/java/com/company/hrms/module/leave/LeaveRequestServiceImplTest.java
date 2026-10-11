package com.company.hrms.module.leave;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.LeaveRequestDto;
import com.company.hrms.model.dto.response.LeaveResponseDto;
import com.company.hrms.model.entity.Employee;
import com.company.hrms.model.entity.LeaveRequest;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.leave.repository.LeaveRequestRepository;
import com.company.hrms.module.leave.service.impl.LeaveRequestServiceImpl;
import com.company.hrms.security.SecurityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LeaveRequestServiceImplTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private SecurityService securityService;

    @InjectMocks
    private LeaveRequestServiceImpl leaveRequestService;

    private Employee employee;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setEmployeeId(1L);
        employee.setFullName("Tran Thi B");
    }

    @Test
    @DisplayName("Ngoại lệ khi ngày kết thúc trước ngày bắt đầu")
    void shouldThrowExceptionWhenEndDateBeforeStartDate() {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setEmployeeId(1L);
        dto.setStartDate(LocalDate.of(2024, 6, 10));
        dto.setEndDate(LocalDate.of(2024, 6, 5));
        dto.setTotalDays(1f);

        AppException ex = assertThrows(AppException.class, () -> leaveRequestService.createLeaveRequest(dto));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Ngày kết thúc không được trước ngày bắt đầu"));
    }

    @Test
    @DisplayName("Không được phép sửa đơn khi không ở trạng thái PENDING")
    void shouldThrowExceptionWhenUpdatingNonPendingLeaveRequest() {
        LeaveRequest existing = new LeaveRequest();
        existing.setLeaveRequestId(100L);
        existing.setStatus("APPROVED");

        when(leaveRequestRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(existing));

        LeaveRequestDto updateDto = new LeaveRequestDto();
        updateDto.setStartDate(LocalDate.of(2024, 7, 1));
        updateDto.setEndDate(LocalDate.of(2024, 7, 2));

        AppException ex = assertThrows(AppException.class, () -> leaveRequestService.updateLeaveRequest(100L, updateDto));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertTrue(ex.getMessage().contains("Chỉ có thể sửa đơn khi ở trạng thái 'Chờ duyệt'"));
    }

    @Test
    @DisplayName("Tạo đơn xin nghỉ phép thành công")
    void shouldCreateLeaveRequestSuccessfully() {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setEmployeeId(1L);
        dto.setLeaveType("Nghỉ phép năm");
        dto.setStartDate(LocalDate.of(2024, 6, 1));
        dto.setEndDate(LocalDate.of(2024, 6, 2));
        dto.setTotalDays(2.0f);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> {
            LeaveRequest saved = invocation.getArgument(0);
            saved.setLeaveRequestId(50L);
            return saved;
        });

        LeaveResponseDto result = leaveRequestService.createLeaveRequest(dto);

        assertNotNull(result);
        assertEquals(50L, result.getLeaveRequestId());
        assertEquals("PENDING", result.getStatus());
        assertEquals("Nghỉ phép năm", result.getLeaveType());
    }
}
