package com.company.hrms.module.payroll;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.response.PayrollResponseDto;
import com.company.hrms.model.entity.*;
import com.company.hrms.model.entity.enums.AttendanceStatus;
import com.company.hrms.module.attendance.repository.AttendanceRepository;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.leave.repository.LeaveRequestRepository;
import com.company.hrms.module.overtime.repository.OvertimeRequestRepository;
import com.company.hrms.module.payroll.repository.PayrollRepository;
import com.company.hrms.module.payroll.service.impl.PayrollServiceImpl;
import com.company.hrms.module.shift.repository.ShiftAssignmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PayrollServiceImplTest {

    @Mock
    private PayrollRepository payrollRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private ShiftAssignmentRepository shiftAssignmentRepository;
    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private LeaveRequestRepository leaveRequestRepository;
    @Mock
    private OvertimeRequestRepository overtimeRequestRepository;

    @InjectMocks
    private PayrollServiceImpl payrollService;

    private Employee mockEmployee;

    @BeforeEach
    void setUp() {
        mockEmployee = new Employee();
        mockEmployee.setEmployeeId(1L);
        mockEmployee.setFullName("Nguyen Van A");
        mockEmployee.setStatus("ACTIVE");
        mockEmployee.setBasicSalary(new BigDecimal("10000000.00"));
    }

    @Test
    @DisplayName("Ngoại lệ khi định dạng kỳ lương không hợp lệ")
    void shouldThrowExceptionWhenPeriodInvalid() {
        AppException ex = assertThrows(AppException.class, () -> payrollService.calculatePayroll("2024-1"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Kỳ lương không hợp lệ"));
    }

    @Test
    @DisplayName("Tính toán bảng lương chính xác với ngày công, phép năm, OT và đi muộn")
    void shouldCalculatePayrollCorrectly() {
        String period = "2024-05";

        when(employeeRepository.findAll()).thenReturn(List.of(mockEmployee));
        when(shiftAssignmentRepository.findByEmployeeEmployeeIdAndAssignDateBetween(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList()); // Mặc định 22 ca chuẩn

        // Giả lập 1 chấm công đủ giờ + đi muộn
        Shift shift = new Shift();
        shift.setStartTime(LocalTime.of(8, 0));
        shift.setEndTime(LocalTime.of(17, 0));
        shift.setBreakDuration(60);

        Attendance att = new Attendance();
        att.setEmployee(mockEmployee);
        att.setShift(shift);
        att.setCheckInTime(LocalDateTime.of(2024, 5, 2, 8, 15));
        att.setCheckOutTime(LocalDateTime.of(2024, 5, 2, 17, 15));
        att.setLateMinutes(15);
        att.setStatus(AttendanceStatus.LATE);

        when(attendanceRepository.findByEmployeeEmployeeIdAndWorkDateBetween(eq(1L), any(), any()))
                .thenReturn(List.of(att));

        // Giả lập 1 đơn nghỉ phép năm đã duyệt: 1 ngày
        LeaveRequest leave = new LeaveRequest();
        leave.setEmployee(mockEmployee);
        leave.setLeaveType("Nghỉ phép năm");
        leave.setStartDate(LocalDate.of(2024, 5, 10));
        leave.setEndDate(LocalDate.of(2024, 5, 10));
        leave.setStatus("APPROVED");

        when(leaveRequestRepository.findAll()).thenReturn(List.of(leave));

        // Giả lập 1 đơn OT đã duyệt: 2 giờ
        OvertimeRequest ot = new OvertimeRequest();
        ot.setEmployee(mockEmployee);
        ot.setOtDate(LocalDate.of(2024, 5, 15));
        ot.setApprovedHours(2.0f);
        ot.setStatus("APPROVED");

        when(overtimeRequestRepository.findAll()).thenReturn(List.of(ot));

        when(payrollRepository.findForUpdateByEmployeeAndPeriod(eq(1L), eq(period)))
                .thenReturn(Optional.empty());

        when(payrollRepository.save(any(Payroll.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<PayrollResponseDto> results = payrollService.calculatePayroll(period);

        assertNotNull(results);
        assertEquals(1, results.size());
        PayrollResponseDto dto = results.get(0);

        assertEquals(1L, dto.getEmployeeId());
        assertEquals("2024-05", dto.getSalaryPeriod());
        // OT pay: 2h * 50,000 = 100,000
        assertEquals(0, new BigDecimal("100000.00").compareTo(dto.getOvertimePay()));
        assertNotNull(dto.getNetSalary());
        verify(payrollRepository, times(1)).save(any(Payroll.class));
    }

    @Test
    @DisplayName("Cập nhật trạng thái bảng lương thành công")
    void shouldUpdatePayrollStatusSuccessfully() {
        Payroll existingPayroll = new Payroll();
        existingPayroll.setPayrollId(10L);
        existingPayroll.setEmployee(mockEmployee);
        existingPayroll.setStatus("Chờ phát");

        when(payrollRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(existingPayroll));
        when(payrollRepository.save(any(Payroll.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PayrollResponseDto updated = payrollService.updatePayrollStatus(10L, "Đã phát");

        assertNotNull(updated);
        assertEquals("Đã phát", updated.getStatus());
        verify(payrollRepository).save(existingPayroll);
    }
}
