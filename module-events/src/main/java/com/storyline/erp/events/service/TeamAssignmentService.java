package com.storyline.erp.events.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.events.entity.TeamAssignment;
import com.storyline.erp.events.repository.TeamAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TeamAssignmentService {

    private final TeamAssignmentRepository teamAssignmentRepository;

    public TeamAssignmentService(TeamAssignmentRepository teamAssignmentRepository) {
        this.teamAssignmentRepository = teamAssignmentRepository;
    }

    public List<TeamAssignment> getTeamByEventId(Long eventId) {
        return teamAssignmentRepository.findByEventId(eventId);
    }

    public TeamAssignment assignTeamMember(TeamAssignment assignment) {
        return teamAssignmentRepository.save(assignment);
    }

    public void removeTeamMember(Long id) {
        teamAssignmentRepository.deleteById(id);
    }
}
