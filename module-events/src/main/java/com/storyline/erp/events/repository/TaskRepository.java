package com.storyline.erp.events.repository;

import com.storyline.erp.events.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByEventId(Long eventId);
    List<Task> findByAssignedUserId(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT t FROM Task t JOIN TeamAssignment ta ON ta.event.id = t.eventId WHERE ta.userId = :userId")
    List<Task> findTeamTasksByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
    
    long countByStatus(String status);
}
