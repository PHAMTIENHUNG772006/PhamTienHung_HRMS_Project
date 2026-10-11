package com.company.hrms.module.overtime.repository;

import com.company.hrms.model.entity.OvertimeRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OvertimeRequestRepository extends JpaRepository<OvertimeRequest, Long> {
    
    @Query("SELECT o FROM OvertimeRequest o LEFT JOIN FETCH o.employee")
    List<OvertimeRequest> findAllWithEmployee();

    @Query("SELECT o FROM OvertimeRequest o LEFT JOIN FETCH o.employee WHERE o.employee.employeeId = :employeeId ORDER BY o.otDate DESC")
    List<OvertimeRequest> findAllByEmployeeEmployeeId(@Param("employeeId") Long employeeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM OvertimeRequest o WHERE o.otRequestId = :id")
    Optional<OvertimeRequest> findByIdForUpdate(@Param("id") Long id);
}