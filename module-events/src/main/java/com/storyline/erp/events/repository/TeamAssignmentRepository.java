package com.storyline.erp.events.repository;

import com.storyline.erp.events.entity.TeamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamAssignmentRepository extends JpaRepository<TeamAssignment, Long> {
    List<TeamAssignment> findByEventId(Long eventId);
    List<TeamAssignment> findByUserId(Long userId);
}
