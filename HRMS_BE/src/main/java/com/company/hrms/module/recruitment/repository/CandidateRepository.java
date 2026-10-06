package com.company.hrms.module.recruitment.repository;

import com.company.hrms.model.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    @Query("SELECT c FROM Candidate c LEFT JOIN FETCH c.campaign r LEFT JOIN FETCH r.position")
    List<Candidate> findAllWithCampaignAndPosition();
}
