package com.storyline.erp.crm.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.crm.dto.FollowUpDto;
import com.storyline.erp.crm.entity.FollowUp;
import com.storyline.erp.crm.repository.FollowUpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FollowUpService {

    private final FollowUpRepository followUpRepository;

    public FollowUpService(FollowUpRepository followUpRepository) {
        this.followUpRepository = followUpRepository;
    }

    public List<FollowUpDto> getLeadFollowUps(Long leadId) {
        return followUpRepository.findByLeadIdOrderByInteractionDateDesc(leadId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<FollowUpDto> getClientFollowUps(Long clientId) {
        return followUpRepository.findByClientIdOrderByInteractionDateDesc(clientId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<FollowUpDto> getUpcomingFollowUps(Long userId, LocalDateTime start, LocalDateTime end) {
        return followUpRepository.findByNextFollowUpDateBetweenAndPerformedByUserId(start, end, userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<FollowUpDto> getAllFollowUps() {
        return followUpRepository.findAll()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public FollowUpDto createFollowUp(FollowUpDto dto) {
        FollowUp followUp = new FollowUp();
        updateEntityFromDto(followUp, dto);
        if (followUp.getInteractionDate() == null) {
            followUp.setInteractionDate(LocalDateTime.now());
        }
        return mapToDto(followUpRepository.save(followUp));
    }

    public FollowUpDto updateFollowUp(Long id, FollowUpDto dto) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FollowUp not found: " + id));
        updateEntityFromDto(followUp, dto);
        return mapToDto(followUpRepository.save(followUp));
    }

    public void deleteFollowUp(Long id) {
        followUpRepository.deleteById(id);
    }

    private FollowUpDto mapToDto(FollowUp entity) {
        return new FollowUpDto(
                entity.getId(), entity.getLeadId(), entity.getClientId(),
                entity.getInteractionType(), entity.getNotes(),
                entity.getInteractionDate(), entity.getNextFollowUpDate(),
                entity.getPerformedByUserId());
    }

    private void updateEntityFromDto(FollowUp entity, FollowUpDto dto) {
        entity.setLeadId(dto.leadId());
        entity.setClientId(dto.clientId());
        entity.setInteractionType(dto.interactionType());
        entity.setNotes(dto.notes());
        if (dto.interactionDate() != null) entity.setInteractionDate(dto.interactionDate());
        entity.setNextFollowUpDate(dto.nextFollowUpDate());
        entity.setPerformedByUserId(dto.performedByUserId());
    }
}
