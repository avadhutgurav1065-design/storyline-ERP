package com.storyline.erp.events.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.events.entity.TeamAssignment;
import com.storyline.erp.events.service.TeamAssignmentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/team-assignments")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EVENT_MANAGER', 'ROLE_EVENT_HEAD')")
public class TeamAssignmentController {

    private final TeamAssignmentService teamAssignmentService;

    public TeamAssignmentController(TeamAssignmentService teamAssignmentService) {
        this.teamAssignmentService = teamAssignmentService;
    }

    @GetMapping("/event/{eventId}")
    public ApiResponse<List<TeamAssignment>> getTeamByEventId(@PathVariable Long eventId) {
        return ApiResponse.success(teamAssignmentService.getTeamByEventId(eventId));
    }

    @PostMapping
    public ApiResponse<TeamAssignment> assignTeamMember(@RequestBody TeamAssignment assignment) {
        return ApiResponse.success("Team member assigned", teamAssignmentService.assignTeamMember(assignment));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> removeTeamMember(@PathVariable Long id) {
        teamAssignmentService.removeTeamMember(id);
        return ApiResponse.success((Void) null, "Team member removed");
    }
}
