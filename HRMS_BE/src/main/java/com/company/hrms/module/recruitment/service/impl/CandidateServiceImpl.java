package com.company.hrms.module.recruitment.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.CandidateApproveDto;
import com.company.hrms.model.dto.request.CandidateRequestDto;
import com.company.hrms.model.dto.response.CandidateResponseDto;
import com.company.hrms.model.entity.*;
import com.company.hrms.module.auth.repository.RoleRepository;
import com.company.hrms.module.auth.repository.UserRepository;
import com.company.hrms.module.department.repository.DepartmentRepository;
import com.company.hrms.module.employee.repository.EmployeeRepository;
import com.company.hrms.module.position.repository.PositionRepository;
import com.company.hrms.module.recruitment.repository.CandidateRepository;
import com.company.hrms.module.recruitment.repository.RecruitmentRepository;
import com.company.hrms.module.recruitment.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;
    private final RecruitmentRepository recruitmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponseDto> getAllCandidates() {
        return candidateRepository.findAllWithCampaignAndPosition().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CandidateResponseDto createCandidate(CandidateRequestDto request) {
        RecruitmentCampaign campaign = recruitmentRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new AppException("Chiến dịch tuyển dụng không tồn tại", HttpStatus.NOT_FOUND));

        Candidate candidate = new Candidate();
        candidate.setCandidateName(request.getCandidateName());
        candidate.setCampaign(campaign);
        candidate.setEmail(request.getEmail());
        candidate.setCvFileUrl(request.getCvFileUrl());
        candidate.setSource(request.getSource());
        candidate.setStatus(request.getStatus() != null ? request.getStatus() : "NEW");

        return mapToDto(candidateRepository.save(candidate));
    }

    @Override
    @Transactional
    public CandidateResponseDto approveCandidate(Long id, CandidateApproveDto request) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new AppException("Ứng viên không tồn tại", HttpStatus.NOT_FOUND));

        // 1. Update candidate status
        candidate.setStatus("Trúng tuyển (Đã chuyển đổi)");
        candidateRepository.save(candidate);

        // 2. Resolve email
        String email = candidate.getEmail();
        if (email == null || email.trim().isEmpty()) {
            String cleanName = candidate.getCandidateName().replaceAll("\\s+", "").toLowerCase();
            email = cleanName + "@company.com";
        }
        if (userRepository.existsByEmail(email)) {
            String cleanName = candidate.getCandidateName().replaceAll("\\s+", "").toLowerCase();
            email = cleanName + candidate.getCandidateId() + "@company.com";
        }

        // 3. Create User account
        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new AppException("Vai trò không tồn tại", HttpStatus.NOT_FOUND));

        User user = new User();
        user.setUsername(candidate.getCandidateName());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("Company@123")); // Default password
        user.setRole(role);
        user.setStatus("ACTIVE");
        user.setIsTemporaryPassword(false);
        user = userRepository.save(user);

        // 4. Create Employee profile
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new AppException("Phòng ban không tồn tại", HttpStatus.NOT_FOUND));

        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new AppException("Chức vụ không tồn tại", HttpStatus.NOT_FOUND));

        Employee employee = new Employee();
        employee.setUser(user);
        employee.setFullName(candidate.getCandidateName());

        // idCardNumber is unique, generate one if not provided
        Long idCard = request.getIdCardNumber() != null ? request.getIdCardNumber() : (System.currentTimeMillis() % 1000000000L);
        while (employeeRepository.existsByIdCardNumber(idCard)) {
            idCard = idCard + 1;
        }
        employee.setIdCardNumber(idCard);
        employee.setDepartment(department);
        employee.setPosition(position);
        employee.setJoiningDate(LocalDate.now());
        employee.setStatus(request.getStatus() != null ? request.getStatus() : "Đang hoạt động");
        employee.setBasicSalary(java.math.BigDecimal.valueOf(10000000.00));

        employeeRepository.save(employee);

        return mapToDto(candidate);
    }

    private CandidateResponseDto mapToDto(Candidate candidate) {
        return CandidateResponseDto.builder()
                .candidateId(candidate.getCandidateId())
                .candidateName(candidate.getCandidateName())
                .email(candidate.getEmail())
                .campaignId(candidate.getCampaign() != null ? candidate.getCampaign().getCampaignId() : null)
                .positionName(candidate.getCampaign() != null && candidate.getCampaign().getPosition() != null 
                        ? candidate.getCampaign().getPosition().getPositionName() : null)
                .cvFileUrl(candidate.getCvFileUrl())
                .source(candidate.getSource())
                .status(candidate.getStatus())
                .build();
    }
}
