package com.storyline.erp.events.repository;

import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByStatus(String status, Pageable pageable);
    Page<Event> findByAssignedTeamId(Long teamId, Pageable pageable);
    Page<Event> findByEventHeadId(Long headId, Pageable pageable);
    long countByStatus(EventStatus status);
}
