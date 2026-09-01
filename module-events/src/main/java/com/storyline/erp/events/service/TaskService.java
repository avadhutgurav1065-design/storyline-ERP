package com.storyline.erp.events.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.events.entity.Task;
import com.storyline.erp.events.repository.TaskRepository;
import org.springframework.context.ApplicationEventPublisher;
import com.storyline.erp.common.event.NotificationEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final com.storyline.erp.events.repository.EventRepository eventRepository;
    private final ApplicationEventPublisher eventPublisher;

    public TaskService(TaskRepository taskRepository, com.storyline.erp.events.repository.EventRepository eventRepository, ApplicationEventPublisher eventPublisher) {
        this.taskRepository = taskRepository;
        this.eventRepository = eventRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<Task> getAllTasks(String filter) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            boolean isStaff = auth.getAuthorities().stream()
                    .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_EVENT_MANAGER") || a.equals("ROLE_FINANCE_MANAGER") || a.equals("SCOPE_ALL"));
            
            try {
                Long currentUserId = Long.parseLong(auth.getName());
                
                // If filter is explicitly "my", return only their assigned tasks regardless of role
                if ("my".equalsIgnoreCase(filter)) {
                    return taskRepository.findByAssignedUserId(currentUserId);
                }
                
                // If filter is explicitly "team", return tasks for events they are assigned to
                if ("team".equalsIgnoreCase(filter)) {
                    return taskRepository.findTeamTasksByUserId(currentUserId);
                }
                
                // If no filter, managers see all
                if (isStaff) {
                    return taskRepository.findAll();
                }
                
                // If no filter and team member, default to their own tasks
                return taskRepository.findByAssignedUserId(currentUserId);
                
            } catch (Exception e) {
                if (isStaff) return taskRepository.findAll();
            }
        }
        throw new org.springframework.security.access.AccessDeniedException("Unauthorized to view tasks.");
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    public Task createTask(Task task) {
        Task saved = taskRepository.save(task);
        if (saved.getAssignedUserId() != null) {
            String eventName = "an Event";
            if (saved.getEvent() != null && saved.getEvent().getId() != null) {
                eventName = eventRepository.findById(saved.getEvent().getId())
                        .map(com.storyline.erp.events.entity.Event::getName)
                        .orElse("an Event");
            }
            eventPublisher.publishEvent(new NotificationEvent(
                    this,
                    saved.getAssignedUserId(),
                    "New Task Assigned",
                    "You have been assigned a new task: '" + saved.getTitle() + "' for event: " + eventName,
                    "TASK_ASSIGNED"
            ));
        }
        return saved;
    }

    public Task updateTask(Long id, Task taskDetails) {
        Task task = getTaskById(id);
        boolean newlyAssigned = taskDetails.getAssignedUserId() != null && !taskDetails.getAssignedUserId().equals(task.getAssignedUserId());

        if (taskDetails.getTitle() != null) task.setTitle(taskDetails.getTitle());
        if (taskDetails.getDescription() != null) task.setDescription(taskDetails.getDescription());
        if (taskDetails.getAssignedUserId() != null) task.setAssignedUserId(taskDetails.getAssignedUserId());
        if (taskDetails.getDueDate() != null) task.setDueDate(taskDetails.getDueDate());
        if (taskDetails.getPriority() != null) task.setPriority(taskDetails.getPriority());
        if (taskDetails.getStatus() != null) task.setStatus(taskDetails.getStatus());
        if (taskDetails.getNotes() != null) task.setNotes(taskDetails.getNotes());
        
        Task saved = taskRepository.save(task);
        
        if (newlyAssigned) {
            String eventName = "an Event";
            if (saved.getEvent() != null && saved.getEvent().getId() != null) {
                eventName = eventRepository.findById(saved.getEvent().getId())
                        .map(com.storyline.erp.events.entity.Event::getName)
                        .orElse("an Event");
            }
            eventPublisher.publishEvent(new NotificationEvent(
                    this,
                    saved.getAssignedUserId(),
                    "New Task Assigned",
                    "You have been assigned a task: '" + saved.getTitle() + "' for event: " + eventName,
                    "TASK_ASSIGNED"
            ));
        }
        
        return saved;
    }

    public void deleteTask(Long id) {
        taskRepository.delete(getTaskById(id));
    }
}
