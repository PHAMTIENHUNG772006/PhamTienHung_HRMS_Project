package com.company.hrms.module.department.repository;

import com.company.hrms.model.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByDepartmentCode(String departmentCode);
    
    // Đã bỏ parentDepartment, chỉ giữ lại manager
    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.manager")
    List<Department> findAllWithDetails();
    
    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.manager WHERE d.departmentId = :id")
    Optional<Department> findByIdWithDetails(Long id);
}