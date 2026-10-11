package com.company.hrms.module.attendance.repository;

import com.company.hrms.model.entity.Attendance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    Optional<Attendance> findByEmployeeEmployeeIdAndWorkDateAndShiftShiftCode(Long employeeId, LocalDate workDate, String shiftCode);
    List<Attendance> findByEmployeeEmployeeIdAndWorkDateBetween(Long employeeId, LocalDate start, LocalDate end);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Attendance a WHERE a.employee.employeeId = :employeeId AND a.workDate = :workDate AND a.shift.shiftCode = :shiftCode")
    Optional<Attendance> findForUpdateByEmployeeAndDateAndShift(
            @Param("employeeId") Long employeeId,
            @Param("workDate") LocalDate workDate,
            @Param("shiftCode") String shiftCode
    );

    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee LEFT JOIN FETCH a.shift WHERE a.employee.employeeId = :employeeId ORDER BY a.workDate DESC, a.checkInTime DESC")
    List<Attendance> findByEmployeeEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee LEFT JOIN FETCH a.shift ORDER BY a.workDate DESC, a.checkInTime DESC")
    List<Attendance> findAllWithDetails();

    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee LEFT JOIN FETCH a.shift WHERE a.workDate BETWEEN :startDate AND :endDate ORDER BY a.workDate DESC, a.checkInTime DESC")
    List<Attendance> findAllByWorkDateBetweenWithDetails(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}