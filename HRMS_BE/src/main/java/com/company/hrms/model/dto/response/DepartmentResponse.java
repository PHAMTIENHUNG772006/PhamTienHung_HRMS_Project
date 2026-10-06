package com.company.hrms.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {
    private Long departmentId;
    private String departmentCode;
    private String departmentName;
    private String description;
    private Long managerId;
    private String managerName;
    private Boolean active;
}