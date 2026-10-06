package com.company.hrms.module.shift.repository;

import com.company.hrms.model.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, String> {
    List<Shift> findByShiftDate(LocalDate shiftDate);
}