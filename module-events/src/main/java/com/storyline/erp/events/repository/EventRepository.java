package com.storyline.erp.events.repository;

import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByStatus(String status, Pageable pageable);
    Page<Event> findByAssignedTeamId(Long teamId, Pageable pageable);
    Page<Event> findByEventHeadId(Long headId, Pageable pageable);
    
    @Query("SELECT DISTINCT e FROM Event e JOIN TeamAssignment ta ON ta.event.id = e.id WHERE ta.userId = :userId")
    Page<Event> findEventsByAssignedUserId(@Param("userId") Long userId, Pageable pageable);

    long countByStatus(EventStatus status);
}
