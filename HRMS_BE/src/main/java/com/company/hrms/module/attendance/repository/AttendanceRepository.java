package com.company.hrms.module.attendance.repository;

import com.company.hrms.model.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);
    Optional<Attendance> findByEmployeeEmployeeIdAndWorkDateAndShiftShiftCode(Long employeeId, LocalDate workDate, String shiftCode);
    List<Attendance> findByEmployeeEmployeeIdAndWorkDateBetween(Long employeeId, LocalDate start, LocalDate end);

    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee LEFT JOIN FETCH a.shift WHERE a.employee.employeeId = :employeeId ORDER BY a.workDate DESC, a.checkInTime DESC")
    List<Attendance> findByEmployeeEmployeeId(Long employeeId);

    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee LEFT JOIN FETCH a.shift ORDER BY a.workDate DESC, a.checkInTime DESC")
    List<Attendance> findAllWithDetails();

    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee LEFT JOIN FETCH a.shift WHERE a.workDate BETWEEN :startDate AND :endDate ORDER BY a.workDate DESC, a.checkInTime DESC")
    List<Attendance> findAllByWorkDateBetweenWithDetails(LocalDate startDate, LocalDate endDate);
}