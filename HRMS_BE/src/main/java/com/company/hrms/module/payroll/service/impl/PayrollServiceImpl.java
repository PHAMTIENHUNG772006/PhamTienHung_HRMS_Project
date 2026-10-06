package com.company.hrms.module.payroll.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.response.PayrollResponseDto;
import com.company.hrms.model.entity.Employee;
import com.company.hrms.model.entity.Payroll;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.payroll.repository.PayrollRepository;
import com.company.hrms.module.payroll.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.hrms.model.entity.ShiftAssignment;
import com.company.hrms.model.entity.Attendance;
import com.company.hrms.model.entity.Shift;
import com.company.hrms.model.entity.LeaveRequest;
import com.company.hrms.model.entity.OvertimeRequest;
import com.company.hrms.module.shift.repository.ShiftAssignmentRepository;
import com.company.hrms.module.attendance.repository.AttendanceRepository;
import com.company.hrms.module.leave.repository.LeaveRequestRepository;
import com.company.hrms.module.overtime.repository.OvertimeRequestRepository;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final OvertimeRequestRepository overtimeRequestRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PayrollResponseDto> getAllPayrolls() {
        return payrollRepository.findAllWithEmployee().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<PayrollResponseDto> calculatePayroll(String period) {
        if (period == null || !period.matches("\\d{4}-\\d{2}")) {
            throw new AppException("Kỳ lương không hợp lệ, yêu cầu định dạng YYYY-MM", HttpStatus.BAD_REQUEST);
        }

        String[] parts = period.split("-");
        int year = Integer.parseInt(parts[0]);
        int month = Integer.parseInt(parts[1]);
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() != null && (
                        "ACTIVE".equalsIgnoreCase(e.getStatus().trim()) ||
                        "Đang hoạt động".equalsIgnoreCase(e.getStatus().trim()) ||
                        "Đang thử việc".equalsIgnoreCase(e.getStatus().trim())
                ))
                .collect(Collectors.toList());

        List<Payroll> calculated = new ArrayList<>();

        for (Employee employee : activeEmployees) {
            BigDecimal basicSalary = employee.getBasicSalary();
            if (basicSalary == null) {
                basicSalary = new BigDecimal("10000000.00");
                if (employee.getPosition() != null && employee.getPosition().getSalaryGrade() != null) {
                    try {
                        basicSalary = new BigDecimal(employee.getPosition().getSalaryGrade());
                    } catch (NumberFormatException e) {
                        // Bỏ qua nếu bậc lương không phải là số
                    }
                }
            }

            // Tính tổng số ca làm việc được gán trong tháng (Số ngày công chuẩn)
            List<ShiftAssignment> assignments = shiftAssignmentRepository
                    .findByEmployeeEmployeeIdAndAssignDateBetween(employee.getEmployeeId(), startOfMonth, endOfMonth);
            int requiredShifts = assignments.size() > 0 ? assignments.size() : 22; // mặc định 22 ca nếu không được phân ca

            // Tính toán công thực tế dựa trên số giờ làm của từng chấm công
            List<Attendance> attendances = attendanceRepository
                    .findByEmployeeEmployeeIdAndWorkDateBetween(employee.getEmployeeId(), startOfMonth, endOfMonth);

            double actualWorkingDays = 0.0;
            int lateCount = 0;
            for (Attendance att : attendances) {
                if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                    Shift shift = att.getShift();
                    if (shift != null) {
                        long standardMins = java.time.Duration.between(shift.getStartTime(), shift.getEndTime()).toMinutes() - shift.getBreakDuration();
                        long actualMins = java.time.Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes() - shift.getBreakDuration();
                        if (standardMins > 0) {
                            if (actualMins >= standardMins) {
                                actualWorkingDays += 1.0;
                            } else if (actualMins > 0) {
                                actualWorkingDays += (double) actualMins / standardMins;
                            }
                        }
                    } else {
                        // Nếu không có ca nhưng có chấm công đầy đủ, tạm tính là 1 công
                        actualWorkingDays += 1.0;
                    }
                }
                
                // Đếm số buổi đi muộn
                if (att.getLateMinutes() != null && att.getLateMinutes() > 0) {
                    lateCount++;
                } else if (com.company.hrms.model.entity.enums.AttendanceStatus.LATE.equals(att.getStatus())) {
                    lateCount++;
                }
            }

            // Tính các ngày nghỉ phép được hưởng lương (Nghỉ phép năm hoặc Thai sản)
            List<LeaveRequest> leaveRequests = leaveRequestRepository.findAll().stream()
                    .filter(lr -> lr.getEmployee().getEmployeeId().equals(employee.getEmployeeId())
                            && !lr.getStartDate().isAfter(endOfMonth)
                            && !lr.getEndDate().isBefore(startOfMonth)
                            && ("APPROVED".equalsIgnoreCase(lr.getStatus()) || "Đã duyệt".equalsIgnoreCase(lr.getStatus())))
                    .collect(Collectors.toList());

            double paidLeaveDays = 0.0;
            for (LeaveRequest lr : leaveRequests) {
                LocalDate overlapStart = lr.getStartDate().isBefore(startOfMonth) ? startOfMonth : lr.getStartDate();
                LocalDate overlapEnd = lr.getEndDate().isAfter(endOfMonth) ? endOfMonth : lr.getEndDate();
                
                if (!overlapStart.isAfter(overlapEnd)) {
                    String type = lr.getLeaveType() != null ? lr.getLeaveType().trim() : "";
                    if ("Nghỉ phép năm".equalsIgnoreCase(type) || "Nghỉ thai sản".equalsIgnoreCase(type)
                            || "PAID_LEAVE".equalsIgnoreCase(type) || "MATERNITY".equalsIgnoreCase(type)) {
                        long days = java.time.temporal.ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
                        paidLeaveDays += days;
                    }
                }
            }

            // Số ngày công thực tế thanh toán = đi làm thực tế + ngày nghỉ được hưởng lương
            double totalWorkingDays = actualWorkingDays + paidLeaveDays;

            BigDecimal salaryFactor = BigDecimal.valueOf(totalWorkingDays).divide(BigDecimal.valueOf(requiredShifts), 4, java.math.RoundingMode.HALF_UP);
            if (salaryFactor.compareTo(BigDecimal.ONE) > 0) {
                salaryFactor = BigDecimal.ONE;
            }
            
            // Lương cơ bản nhận được tương ứng với ngày công
            BigDecimal baseEarned = basicSalary.multiply(salaryFactor);
            
            // Lương OT = Tổng số giờ OT đã duyệt * 50k
            List<OvertimeRequest> otRequests = overtimeRequestRepository.findAll().stream()
                    .filter(ot -> ot.getEmployee().getEmployeeId().equals(employee.getEmployeeId())
                            && !ot.getOtDate().isBefore(startOfMonth)
                            && !ot.getOtDate().isAfter(endOfMonth)
                            && ("APPROVED".equalsIgnoreCase(ot.getStatus()) || "Đã duyệt".equalsIgnoreCase(ot.getStatus())))
                    .collect(Collectors.toList());

            float totalOtHours = 0.0f;
            for (OvertimeRequest ot : otRequests) {
                if (ot.getApprovedHours() != null) {
                    totalOtHours += ot.getApprovedHours();
                }
            }
            BigDecimal overtimePay = BigDecimal.valueOf(totalOtHours).multiply(new BigDecimal("50000.00"));

            // Phụ cấp (Mặc định 0 hoặc theo nghiệp vụ)
            BigDecimal allowance = BigDecimal.ZERO;
            
            // Khấu trừ đi muộn: mỗi buổi trừ 20k
            BigDecimal lateDeductions = BigDecimal.valueOf(lateCount).multiply(new BigDecimal("20000.00"));
            
            // Tổng các khoản khấu trừ = BHXH/BHYT (10.5% lương nhận) + Tiền phạt đi muộn
            BigDecimal deductions = baseEarned.multiply(new BigDecimal("0.105")).add(lateDeductions);
            
            // Lương thực nhận = Lương cơ bản nhận theo công + Phụ cấp + Lương OT - Khấu trừ
            BigDecimal netSalary = baseEarned.add(allowance).add(overtimePay).subtract(deductions);

            Optional<Payroll> existingOpt = payrollRepository
                    .findByEmployeeEmployeeIdAndSalaryPeriod(employee.getEmployeeId(), period);

            Payroll payroll;
            if (existingOpt.isPresent()) {
                payroll = existingOpt.get();
            } else {
                payroll = new Payroll();
                payroll.setEmployee(employee);
                payroll.setSalaryPeriod(period);
                payroll.setStatus("Chờ phát");
            }
            
            payroll.setBasicSalary(basicSalary);
            payroll.setAllowance(allowance);
            payroll.setOvertimePay(overtimePay);
            payroll.setDeductions(deductions);
            payroll.setNetSalary(netSalary);

            calculated.add(payrollRepository.save(payroll));
        }

        return calculated.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PayrollResponseDto updatePayrollStatus(Long id, String status) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy bảng lương", HttpStatus.NOT_FOUND));
        payroll.setStatus(status);
        return mapToDto(payrollRepository.save(payroll));
    }

    private PayrollResponseDto mapToDto(Payroll payroll) {
        return PayrollResponseDto.builder()
                .payrollId(payroll.getPayrollId())
                .employeeId(payroll.getEmployee() != null ? payroll.getEmployee().getEmployeeId() : null)
                .employeeName(payroll.getEmployee() != null ? payroll.getEmployee().getFullName() : null)
                .salaryPeriod(payroll.getSalaryPeriod())
                .basicSalary(payroll.getBasicSalary())
                .allowance(payroll.getAllowance())
                .overtimePay(payroll.getOvertimePay())
                .deductions(payroll.getDeductions())
                .netSalary(payroll.getNetSalary())
                .status(payroll.getStatus())
                .build();
    }
}