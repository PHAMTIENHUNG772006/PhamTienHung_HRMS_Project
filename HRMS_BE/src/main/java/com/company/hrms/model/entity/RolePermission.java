package com.company.hrms.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "role_permissions")
@Getter
@Setter
public class RolePermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "module_code", length = 10, nullable = false)
    private String moduleCode;

    @Column(name = "can_view")
    private Boolean canView = false;

    @Column(name = "can_edit")
    private Boolean canEdit = false;

    @Column(name = "can_approve")
    private Boolean canApprove = false;
}
