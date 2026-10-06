package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "recruitment_campaigns")
@Getter
@Setter
public class RecruitmentCampaign extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "campaign_id")
    private Long campaignId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    @Column(name = "quantity_needed", nullable = false)
    private Integer quantityNeeded;

    @Column(name = "deadline", nullable = false)
    private LocalDate deadline;

    @Column(name = "description", length = 1000)
    private String description;
}
