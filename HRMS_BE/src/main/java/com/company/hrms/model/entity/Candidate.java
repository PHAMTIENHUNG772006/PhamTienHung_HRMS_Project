package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "candidates")
@Getter
@Setter
public class Candidate extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "candidate_id")
    private Long candidateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private RecruitmentCampaign campaign;

    @Column(name = "candidate_name", length = 100, nullable = false)
    private String candidateName;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "cv_file_url", nullable = false)
    private String cvFileUrl;

    @Column(name = "source", length = 50)
    private String source;

    @Column(name = "status", length = 50, nullable = false)
    private String status;
}
