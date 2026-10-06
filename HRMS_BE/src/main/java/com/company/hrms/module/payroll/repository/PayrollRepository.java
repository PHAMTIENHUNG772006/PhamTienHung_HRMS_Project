package com.company.hrms.module.payroll.repository;

import com.company.hrms.model.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    
    @Query("SELECT p FROM Payroll p LEFT JOIN FETCH p.employee")
    List<Payroll> findAllWithEmployee();

    Optional<Payroll> findByEmployeeEmployeeIdAndSalaryPeriod(Long employeeId, String salaryPeriod);
}