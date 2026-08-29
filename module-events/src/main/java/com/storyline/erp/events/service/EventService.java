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
import com.storyline.erp.common.event.NotificationEvent;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher eventPublisher;

    public EventService(EventRepository eventRepository, TaskRepository taskRepository, 
                        VendorAssignmentRepository vendorAssignmentRepository,
                        TeamAssignmentRepository teamAssignmentRepository,
                        EventDocumentRepository eventDocumentRepository,
                        ApplicationEventPublisher eventPublisher) {
        this.eventRepository = eventRepository;
        this.taskRepository = taskRepository;
        this.vendorAssignmentRepository = vendorAssignmentRepository;
        this.teamAssignmentRepository = teamAssignmentRepository;
        this.eventDocumentRepository = eventDocumentRepository;
        this.eventPublisher = eventPublisher;
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
            // Check if they are an event head (from auth or just checking the query)
            // But actually finding by assigned user covers both if we want to be safe, or we can combine.
            // Let's return events where they are assigned. Event Heads are also assigned via TeamAssignment in most properly built systems,
            // but just in case they aren't, we can fall back to checking if they are assigned.
            Page<Event> headEvents = eventRepository.findByEventHeadId(currentUserId, pageable);
            if (headEvents.getTotalElements() > 0) {
                return headEvents;
            }
            
            return eventRepository.findEventsByAssignedUserId(currentUserId, pageable);
        }

        throw new org.springframework.security.access.AccessDeniedException("Unauthorized to view events.");
    }

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }
    
    public Event updateEvent(Long id, Event updated) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        boolean statusChanged = updated.getStatus() != null && !updated.getStatus().equals(event.getStatus());
        
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
        event.setBudget(updated.getBudget());
        
        Event saved = eventRepository.save(event);
        
        if (statusChanged && updated.getNotes() != null && !updated.getNotes().isBlank()) {
            // Notify Head
            if (saved.getEventHeadId() != null) {
                eventPublisher.publishEvent(new NotificationEvent(this, saved.getEventHeadId(), 
                    "Event Status Problem: " + saved.getName(), 
                    updated.getNotes(), 
                    "EVENT_PROBLEM"));
            }
            // Notify Admin (ID 1 for now)
            eventPublisher.publishEvent(new NotificationEvent(this, 1L, 
                "Event Status Problem: " + saved.getName(), 
                updated.getNotes(), 
                "EVENT_PROBLEM"));
        }
        
        return saved;
    }

    public EventDashboardDto getEventDashboard(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        // Validate access
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            boolean isAdminOrStaff = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_EVENT_MANAGER") || a.equals("SCOPE_ALL"));
            
            if (!isAdminOrStaff) {
                Long currentUserId = extractUserId(auth);
                if (currentUserId != null) {
                    if (event.getEventHeadId() != null && !event.getEventHeadId().equals(currentUserId)) {
                        // Check if they are in team assignments
                        boolean isAssigned = teamAssignmentRepository.findByEventId(id).stream()
                                .anyMatch(ta -> ta.getUserId().equals(currentUserId));
                        if (!isAssigned) {
                            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to view this event's dashboard.");
                        }
                    }
                }
            }
        }

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
