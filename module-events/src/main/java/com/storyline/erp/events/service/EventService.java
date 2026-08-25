package com.storyline.erp.events.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.events.dto.EventDashboardDto;
import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.entity.Task;
import com.storyline.erp.events.entity.VendorAssignment;
import com.storyline.erp.events.repository.EventRepository;
import com.storyline.erp.events.repository.TaskRepository;
import com.storyline.erp.events.repository.VendorAssignmentRepository;
import com.storyline.erp.events.repository.TeamAssignmentRepository;
import com.storyline.erp.events.repository.EventDocumentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final TaskRepository taskRepository;
    private final VendorAssignmentRepository vendorAssignmentRepository;
    private final TeamAssignmentRepository teamAssignmentRepository;
    private final EventDocumentRepository eventDocumentRepository;

    public EventService(EventRepository eventRepository, TaskRepository taskRepository, 
                        VendorAssignmentRepository vendorAssignmentRepository,
                        TeamAssignmentRepository teamAssignmentRepository,
                        EventDocumentRepository eventDocumentRepository) {
        this.eventRepository = eventRepository;
        this.taskRepository = taskRepository;
        this.vendorAssignmentRepository = vendorAssignmentRepository;
        this.teamAssignmentRepository = teamAssignmentRepository;
        this.eventDocumentRepository = eventDocumentRepository;
    }

    public Page<Event> listEvents(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        boolean isAdmin = false;
        boolean isStaff = false;
        
        if (auth != null) {
            isAdmin = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("SCOPE_ALL"));
                    
            isStaff = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_STAFF") || a.equals("ROLE_EVENT_MANAGER"));
        }

        if (isAdmin || isStaff) {
            return eventRepository.findAll(pageable);
        }

        Long currentUserId = extractUserId(auth);
        if (currentUserId != null) {
            return eventRepository.findByEventHeadId(currentUserId, pageable);
        }

        // Default to returning all for now to avoid the UI looking broken
        return eventRepository.findAll(pageable);
    }

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }
    
    public Event updateEvent(Long id, Event updated) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        event.setName(updated.getName());
        event.setStartDate(updated.getStartDate());
        event.setEndDate(updated.getEndDate());
        event.setVenue(updated.getVenue());
        event.setPax(updated.getPax());
        event.setStatus(updated.getStatus());
        event.setProgress(updated.getProgress());
        event.setAssignedTeamId(updated.getAssignedTeamId());
        event.setEventHeadId(updated.getEventHeadId());
        event.setNotes(updated.getNotes());
        return eventRepository.save(event);
    }

    public EventDashboardDto getEventDashboard(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        List<Task> tasks = taskRepository.findByEventId(id);
        List<VendorAssignment> vendors = vendorAssignmentRepository.findByEventId(id);
        
        var teamAssignments = teamAssignmentRepository.findByEventId(id);
        var documents = eventDocumentRepository.findByEventId(id);

        int progress = 0;
        if (!tasks.isEmpty()) {
            long completed = tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
            progress = (int) ((completed * 100) / tasks.size());
            
            if (event.getProgress() == null || event.getProgress() != progress) {
                event.setProgress(progress);
                eventRepository.save(event);
            }
        }

        return new EventDashboardDto(event, tasks, vendors, teamAssignments, documents, progress);
    }

    private Long extractUserId(Authentication auth) {
        try {
            if (auth != null && auth.getName() != null) {
                return Long.parseLong(auth.getName());
            }
        } catch (Exception ignored) {}
        return null;
    }
}
