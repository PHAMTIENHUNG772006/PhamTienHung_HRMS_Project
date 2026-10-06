package com.company.hrms.module.overtime.repository;

import com.company.hrms.model.entity.OvertimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OvertimeRequestRepository extends JpaRepository<OvertimeRequest, Long> {
    @Query("SELECT o FROM OvertimeRequest o LEFT JOIN FETCH o.employee")
    List<OvertimeRequest> findAllWithEmployee();
}