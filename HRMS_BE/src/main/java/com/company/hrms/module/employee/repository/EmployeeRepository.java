package com.company.hrms.module.employee.repository;

import com.company.hrms.model.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByIdCardNumber(Long idCardNumber);
    Optional<Employee> findByUserUserId(Long userId);
    boolean existsByDepartmentDepartmentId(Long departmentId);
    boolean existsByPositionPositionId(Long positionId);
}