package com.company.hrms.module.recruitment.service.impl;

import com.company.hrms.common.exception.AppException;
import com.company.hrms.model.dto.request.RecruitmentRequestDto;
import com.company.hrms.model.dto.response.RecruitmentResponseDto;
import com.company.hrms.model.entity.Position;
import com.company.hrms.model.entity.RecruitmentCampaign;
import com.company.hrms.module.position.repository.PositionRepository;
import com.company.hrms.module.recruitment.repository.RecruitmentRepository;
import com.company.hrms.module.recruitment.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecruitmentServiceImpl implements RecruitmentService {

    private final RecruitmentRepository recruitmentRepository;
    private final PositionRepository positionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RecruitmentResponseDto> getAllCampaigns() {
        return recruitmentRepository.findAllWithPosition().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RecruitmentResponseDto createCampaign(RecruitmentRequestDto request) {
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new AppException("Vị trí không tồn tại", HttpStatus.NOT_FOUND));

        RecruitmentCampaign campaign = new RecruitmentCampaign();
        campaign.setPosition(position);
        campaign.setQuantityNeeded(request.getQuantityNeeded());
        campaign.setDeadline(request.getDeadline());
        campaign.setDescription(request.getDescription());

        return mapToDto(recruitmentRepository.save(campaign));
    }

    @Override
    @Transactional
    public RecruitmentResponseDto updateCampaign(Long id, RecruitmentRequestDto request) {
        RecruitmentCampaign campaign = recruitmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy chiến dịch", HttpStatus.NOT_FOUND));

        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new AppException("Vị trí không tồn tại", HttpStatus.NOT_FOUND));

        campaign.setPosition(position);
        campaign.setQuantityNeeded(request.getQuantityNeeded());
        campaign.setDeadline(request.getDeadline());
        campaign.setDescription(request.getDescription());

        return mapToDto(recruitmentRepository.save(campaign));
    }

    @Override
    @Transactional
    public void deleteCampaign(Long id) {
        if (!recruitmentRepository.existsById(id)) {
            throw new AppException("Không tìm thấy chiến dịch", HttpStatus.NOT_FOUND);
        }
        recruitmentRepository.deleteById(id);
    }

    private RecruitmentResponseDto mapToDto(RecruitmentCampaign campaign) {
        return RecruitmentResponseDto.builder()
                .campaignId(campaign.getCampaignId())
                .positionId(campaign.getPosition() != null ? campaign.getPosition().getPositionId() : null)
                .positionName(campaign.getPosition() != null ? campaign.getPosition().getPositionName() : null)
                .quantityNeeded(campaign.getQuantityNeeded())
                .deadline(campaign.getDeadline())
                .description(campaign.getDescription())
                .build();
    }
}