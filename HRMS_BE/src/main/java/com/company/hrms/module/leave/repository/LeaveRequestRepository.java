package com.company.hrms.module.leave.repository;

import com.company.hrms.model.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    @Query("SELECT l FROM LeaveRequest l LEFT JOIN FETCH l.employee")
    List<LeaveRequest> findAllWithEmployee();
}