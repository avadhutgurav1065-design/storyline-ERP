package com.storyline.erp.events.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.events.entity.TeamAssignment;
import com.storyline.erp.events.repository.TeamAssignmentRepository;
import org.springframework.context.ApplicationEventPublisher;
import com.storyline.erp.common.event.NotificationEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TeamAssignmentService {

    private final TeamAssignmentRepository teamAssignmentRepository;
    private final ApplicationEventPublisher eventPublisher;

    public TeamAssignmentService(TeamAssignmentRepository teamAssignmentRepository, ApplicationEventPublisher eventPublisher) {
        this.teamAssignmentRepository = teamAssignmentRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<TeamAssignment> getTeamByEventId(Long eventId) {
        return teamAssignmentRepository.findByEventId(eventId);
    }

    public TeamAssignment assignTeamMember(TeamAssignment assignment) {
        TeamAssignment saved = teamAssignmentRepository.save(assignment);
        if (saved.getUserId() != null) {
            String roleName = saved.getRole() != null ? saved.getRole() : "the team";
            eventPublisher.publishEvent(new NotificationEvent(
                    this,
                    saved.getUserId(),
                    "Assigned to Event",
                    "You have been assigned to event ID " + (saved.getEvent() != null ? saved.getEvent().getId() : "") + " as " + roleName,
                    "EVENT_ASSIGNED"
            ));
        }
        return saved;
    }

    public void removeTeamMember(Long id) {
        teamAssignmentRepository.deleteById(id);
    }
}
