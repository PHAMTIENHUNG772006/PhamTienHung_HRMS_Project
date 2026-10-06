package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "assets")
@Getter
@Setter
public class Asset extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Long assetId;

    @Column(name = "asset_name", length = 100, nullable = false)
    private String assetName;

    @Column(name = "asset_type", length = 30, nullable = false)
    private String assetType;

    @Column(name = "status", length = 20, nullable = false)
    private String status;
}
