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
    private final ApplicationEventPublisher eventPublisher;

    public TaskService(TaskRepository taskRepository, ApplicationEventPublisher eventPublisher) {
        this.taskRepository = taskRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    public Task createTask(Task task) {
        Task saved = taskRepository.save(task);
        if (saved.getAssignedUserId() != null) {
            eventPublisher.publishEvent(new NotificationEvent(
                    this,
                    saved.getAssignedUserId(),
                    "New Task Assigned",
                    "You have been assigned a new task: " + saved.getTitle(),
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
            eventPublisher.publishEvent(new NotificationEvent(
                    this,
                    saved.getAssignedUserId(),
                    "New Task Assigned",
                    "You have been assigned a task: " + saved.getTitle(),
                    "TASK_ASSIGNED"
            ));
        }
        
        return saved;
    }

    public void deleteTask(Long id) {
        taskRepository.delete(getTaskById(id));
    }
}
