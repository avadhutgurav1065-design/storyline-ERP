package com.storyline.erp.events.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.entity.TeamAssignment;
import com.storyline.erp.events.entity.EventDocument;
import com.storyline.erp.events.dto.EventDashboardDto;
import com.storyline.erp.events.service.EventService;
import com.storyline.erp.events.repository.TeamAssignmentRepository;
import com.storyline.erp.events.repository.EventDocumentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    
    private final EventService eventService;
    private final TeamAssignmentRepository teamAssignmentRepository;
    private final EventDocumentRepository eventDocumentRepository;
    
    public EventController(EventService eventService, TeamAssignmentRepository teamAssignmentRepository, EventDocumentRepository eventDocumentRepository) {
        this.eventService = eventService;
        this.teamAssignmentRepository = teamAssignmentRepository;
        this.eventDocumentRepository = eventDocumentRepository;
    }
    
    @GetMapping
    public ApiResponse<PageResponse<Event>> listEvents(Pageable pageable) {
        return ApiResponse.success(PageResponse.of(eventService.listEvents(pageable)));
    }
    
    @PostMapping
    public ApiResponse<Event> createEvent(@RequestBody Event event) {
        return ApiResponse.success("Event created", eventService.createEvent(event));
    }

    @PutMapping("/{id}")
    public ApiResponse<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return ApiResponse.success("Event updated", eventService.updateEvent(id, event));
    }

    @GetMapping("/{id}/dashboard")
    public ApiResponse<EventDashboardDto> getEventDashboard(@PathVariable Long id) {
        return ApiResponse.success(eventService.getEventDashboard(id));
    }

    @PostMapping("/{id}/team")
    public ApiResponse<TeamAssignment> addTeamAssignment(@PathVariable Long id, @RequestBody TeamAssignment assignment) {
        Event event = new Event();
        event.setId(id);
        assignment.setEvent(event);
        return ApiResponse.success("Team member assigned", teamAssignmentRepository.save(assignment));
    }
    
    @DeleteMapping("/team/{assignmentId}")
    public ApiResponse<Void> removeTeamAssignment(@PathVariable Long assignmentId) {
        teamAssignmentRepository.deleteById(assignmentId);
        return ApiResponse.success("Team member removed", (Void) null);
    }

    @PostMapping("/{id}/documents")
    public ApiResponse<EventDocument> addDocument(@PathVariable Long id, @RequestBody EventDocument document) {
        Event event = new Event();
        event.setId(id);
        document.setEvent(event);
        return ApiResponse.success("Document added", eventDocumentRepository.save(document));
    }

    @DeleteMapping("/documents/{documentId}")
    public ApiResponse<Void> removeDocument(@PathVariable Long documentId) {
        eventDocumentRepository.deleteById(documentId);
        return ApiResponse.success("Document removed", (Void) null);
    }
}
