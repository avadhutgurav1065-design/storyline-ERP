package com.storyline.erp.events.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.events.entity.Task;
import com.storyline.erp.events.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task taskDetails) {
        Task task = getTaskById(id);
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setAssignedUserId(taskDetails.getAssignedUserId());
        task.setDueDate(taskDetails.getDueDate());
        task.setPriority(taskDetails.getPriority());
        task.setStatus(taskDetails.getStatus());
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.delete(getTaskById(id));
    }
}
