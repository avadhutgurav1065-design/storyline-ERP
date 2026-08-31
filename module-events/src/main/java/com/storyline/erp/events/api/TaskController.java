package com.storyline.erp.events.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.events.entity.Task;
import com.storyline.erp.events.service.TaskService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@PreAuthorize("isAuthenticated()") // Service layer handles specific access
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ApiResponse<List<Task>> getAllTasks(@RequestParam(required = false) String filter) {
        return ApiResponse.success(taskService.getAllTasks(filter));
    }

    @GetMapping("/{id}")
    public ApiResponse<Task> getTaskById(@PathVariable Long id) {
        return ApiResponse.success(taskService.getTaskById(id));
    }

    @PostMapping
    public ApiResponse<Task> createTask(@RequestBody Task task) {
        return ApiResponse.success("Task created", taskService.createTask(task));
    }

    @PutMapping("/{id}")
    public ApiResponse<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        return ApiResponse.success("Task updated", taskService.updateTask(id, task));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ApiResponse.success((Void) null, "Task deleted");
    }
}
