package com.company.hrms.module.attendance.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.response.AttendanceResponseDto;
import java.util.Optional;
import com.company.hrms.model.entity.Attendance;
import com.company.hrms.model.entity.Employee;
import com.company.hrms.model.entity.Shift;
import com.company.hrms.model.entity.ShiftAssignment;
import com.company.hrms.model.entity.User;
import com.company.hrms.model.entity.enums.AttendanceStatus;
import com.company.hrms.module.attendance.repository.AttendanceRepository;
import com.company.hrms.module.attendance.service.AttendanceService;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.shift.repository.ShiftAssignmentRepository;
import com.company.hrms.module.shift.repository.ShiftRepository;
import com.company.hrms.module.storage.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final ShiftRepository shiftRepository;
    private final CloudinaryService cloudinaryService;

    private static final String ATTENDANCE_IMAGE_FOLDER = "hrms/attendances";

    @Override
    @Transactional
    public AttendanceResponseDto checkIn(Authentication authentication, MultipartFile image, String shiftCode) {
        Employee employee = getEmployeeFromAuthentication(authentication);
        Long employeeId = employee.getEmployeeId();
        LocalDate today = LocalDate.now();

        if (shiftCode == null || shiftCode.trim().isEmpty()) {
            throw new AppException("Vui lòng chọn ca làm việc để check-in", HttpStatus.BAD_REQUEST);
        }

        // Validate 1: Kiểm tra ca làm việc có tồn tại trong hệ thống (bảng Shift) không
        Shift shift = shiftRepository.findById(shiftCode)
                .orElseThrow(() -> new AppException("Ca làm việc '" + shiftCode + "' không tồn tại trong hệ thống.", HttpStatus.NOT_FOUND));

        // Validate 2: Kiểm tra xem nhân viên có được quản lý phân ca này vào HÔM NAY không
        Optional<ShiftAssignment> assignmentOpt = shiftAssignmentRepository
                .findByEmployeeEmployeeIdAndAssignDateAndShiftShiftCode(employeeId, today, shiftCode);
        if (assignmentOpt.isEmpty()) {
            throw new AppException("Lỗi: Bạn KHÔNG được phân công làm ca '" + shift.getShiftName() + "' vào ngày hôm nay.", HttpStatus.FORBIDDEN);
        }

        // Validate 3: Kiểm tra xem đã check-in ca này hôm nay chưa
        if (attendanceRepository.findByEmployeeEmployeeIdAndWorkDateAndShiftShiftCode(employeeId, today, shiftCode).isPresent()) {
            throw new AppException("Bạn đã thực hiện check-in cho ca '" + shift.getShiftName() + "' ngày hôm nay rồi.", HttpStatus.CONFLICT);
        }

        LocalTime shiftStartTime = shift.getStartTime();
        String imageUrl = cloudinaryService.uploadFile(image, ATTENDANCE_IMAGE_FOLDER);
        LocalDateTime now = LocalDateTime.now();
        
        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setWorkDate(today);
        attendance.setCheckInTime(now);
        attendance.setCheckInImage(imageUrl);
        attendance.setShift(shift);

        // Tính số phút đi muộn (nếu check-in sau giờ bắt đầu ca)
        if (now.toLocalTime().isAfter(shiftStartTime)) {
            long minutesLate = java.time.Duration.between(shiftStartTime, now.toLocalTime()).toMinutes();
            attendance.setLateMinutes((int) minutesLate);
            attendance.setStatus(AttendanceStatus.LATE);
        } else {
            attendance.setStatus(AttendanceStatus.PRESENT);
        }

        return mapToDto(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public AttendanceResponseDto checkOut(Authentication authentication, MultipartFile image, String shiftCode) {
        Employee employee = getEmployeeFromAuthentication(authentication);
        Long employeeId = employee.getEmployeeId();
        LocalDate today = LocalDate.now();

        if (shiftCode == null || shiftCode.trim().isEmpty()) {
            throw new AppException("Vui lòng chọn ca làm việc để check-out", HttpStatus.BAD_REQUEST);
        }

        // Validate 1: Kiểm tra xem nhân viên đã CHECK-IN ca này hôm nay chưa
        Attendance attendance = attendanceRepository.findByEmployeeEmployeeIdAndWorkDateAndShiftShiftCode(employeeId, today, shiftCode)
                .orElseThrow(() -> new AppException("Lỗi: Bạn CHƯA check-in ca '" + shiftCode + "' ngày hôm nay. Không thể check-out.", HttpStatus.BAD_REQUEST));

        // Validate 2: Kiểm tra xem đã check-out chưa
        if (attendance.getCheckOutTime() != null) {
            throw new AppException("Bạn đã thực hiện check-out cho ca này rồi.", HttpStatus.CONFLICT);
        }

        // Lấy giờ kết thúc ca từ shift đã lưu trong bản ghi attendance
        Shift shift = attendance.getShift();
        LocalTime shiftEndTime = (shift != null) ? shift.getEndTime() : LocalTime.of(17, 0);

        String imageUrl = cloudinaryService.uploadFile(image, ATTENDANCE_IMAGE_FOLDER);
        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckOutTime(now);
        attendance.setCheckOutImage(imageUrl);

        // Tính số phút về sớm (nếu check-out trước giờ kết thúc ca)
        if (now.toLocalTime().isBefore(shiftEndTime)) {
            long minutesEarly = java.time.Duration.between(now.toLocalTime(), shiftEndTime).toMinutes();
            attendance.setEarlyMinutes((int) minutesEarly);
            // Nếu sáng đi muộn thì vẫn ưu tiên giữ trạng thái LATE, nếu ko muộn thì set EARLY_LEAVE
            if (attendance.getStatus() != AttendanceStatus.LATE) {
                attendance.setStatus(AttendanceStatus.EARLY_LEAVE);
            }
        } else {
            attendance.setEarlyMinutes(0);
        }

        return mapToDto(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getMyAttendances(Authentication authentication) {
        Employee employee = getEmployeeFromAuthentication(authentication);
        return attendanceRepository.findByEmployeeEmployeeId(employee.getEmployeeId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private Employee getEmployeeFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AppException("Chưa xác thực người dùng", HttpStatus.UNAUTHORIZED);
        }
        
        Object principal = authentication.getPrincipal();
        Long userId;
        
        if (principal instanceof User) {
             userId = ((User) principal).getUserId();
        } else {
             throw new AppException("Lỗi định dạng xác thực", HttpStatus.UNAUTHORIZED);
        }
        
        return employeeRepository.findByUserUserId(userId)
                .orElseThrow(() -> new AppException("Không tìm thấy hồ sơ nhân viên cho tài khoản này", HttpStatus.NOT_FOUND));
    }

    private AttendanceResponseDto mapToDto(Attendance attendance) {
        Shift shift = attendance.getShift();
        Double actualHours = null;
        Boolean isFullWorkDay = null;
        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
            long mins = java.time.Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime()).toMinutes();
            if (shift != null) {
                mins = mins - (shift.getBreakDuration() != null ? shift.getBreakDuration() : 0);
                if (mins < 0) mins = 0;
                long standardMins = java.time.Duration.between(shift.getStartTime(), shift.getEndTime()).toMinutes() - (shift.getBreakDuration() != null ? shift.getBreakDuration() : 0);
                isFullWorkDay = mins >= standardMins;
            }
            actualHours = (double) mins / 60.0;
        }

        return AttendanceResponseDto.builder()
                .attendanceId(attendance.getAttendanceId())
                .employeeId(attendance.getEmployee().getEmployeeId())
                .employeeName(attendance.getEmployee().getFullName())
                .workDate(attendance.getWorkDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus())
                .lateMinutes(attendance.getLateMinutes())
                .earlyMinutes(attendance.getEarlyMinutes())
                .checkInImage(attendance.getCheckInImage())
                .checkOutImage(attendance.getCheckOutImage())
                .shiftCode(shift != null ? shift.getShiftCode() : null)
                .shiftName(shift != null ? shift.getShiftName() : null)
                .shiftStartTime(shift != null ? shift.getStartTime() : null)
                .shiftEndTime(shift != null ? shift.getEndTime() : null)
                .actualHours(actualHours)
                .isFullWorkDay(isFullWorkDay)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getAllAttendances(LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendances;
        if (startDate != null && endDate != null) {
            attendances = attendanceRepository.findAllByWorkDateBetweenWithDetails(startDate, endDate);
        } else {
            attendances = attendanceRepository.findAllWithDetails();
        }
        return attendances.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
}