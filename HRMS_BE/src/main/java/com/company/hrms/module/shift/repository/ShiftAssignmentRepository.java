package com.company.hrms.module.shift.repository;

import com.company.hrms.model.entity.ShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {
    Optional<ShiftAssignment> findByEmployeeEmployeeIdAndAssignDate(Long employeeId, LocalDate assignDate);
    Optional<ShiftAssignment> findByEmployeeEmployeeIdAndAssignDateAndShiftShiftCode(Long employeeId, LocalDate assignDate, String shiftCode);
    List<ShiftAssignment> findByAssignDate(LocalDate assignDate);
    List<ShiftAssignment> findByEmployeeEmployeeIdAndAssignDateBetween(Long employeeId, LocalDate start, LocalDate end);

    @Query("SELECT sa FROM ShiftAssignment sa LEFT JOIN FETCH sa.employee LEFT JOIN FETCH sa.shift WHERE sa.assignDate BETWEEN :startDate AND :endDate")
    List<ShiftAssignment> findByDateRangeWithDetails(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}