package com.company.hrms.module.payroll.repository;

import com.company.hrms.model.entity.Payroll;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    
    @Query("SELECT p FROM Payroll p LEFT JOIN FETCH p.employee")
    List<Payroll> findAllWithEmployee();

    Optional<Payroll> findByEmployeeEmployeeIdAndSalaryPeriod(Long employeeId, String salaryPeriod);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Payroll p WHERE p.employee.employeeId = :employeeId AND p.salaryPeriod = :salaryPeriod")
    Optional<Payroll> findForUpdateByEmployeeAndPeriod(@Param("employeeId") Long employeeId, @Param("salaryPeriod") String salaryPeriod);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Payroll p WHERE p.payrollId = :payrollId")
    Optional<Payroll> findByIdForUpdate(@Param("payrollId") Long payrollId);
}