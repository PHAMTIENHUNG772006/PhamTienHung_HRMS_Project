package com.company.hrms.module.leave.repository;

import com.company.hrms.model.entity.LeaveRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    @Query("SELECT l FROM LeaveRequest l LEFT JOIN FETCH l.employee")
    List<LeaveRequest> findAllWithEmployee();

    @Query("SELECT l FROM LeaveRequest l LEFT JOIN FETCH l.employee WHERE l.employee.employeeId = :employeeId ORDER BY l.startDate DESC")
    List<LeaveRequest> findAllByEmployeeEmployeeId(@Param("employeeId") Long employeeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM LeaveRequest l WHERE l.leaveRequestId = :id")
    Optional<LeaveRequest> findByIdForUpdate(@Param("id") Long id);
}