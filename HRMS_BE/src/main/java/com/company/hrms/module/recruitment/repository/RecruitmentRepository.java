package com.company.hrms.module.recruitment.repository;

import com.company.hrms.model.entity.RecruitmentCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruitmentRepository extends JpaRepository<RecruitmentCampaign, Long> {
    @Query("SELECT r FROM RecruitmentCampaign r LEFT JOIN FETCH r.position")
    List<RecruitmentCampaign> findAllWithPosition();
}