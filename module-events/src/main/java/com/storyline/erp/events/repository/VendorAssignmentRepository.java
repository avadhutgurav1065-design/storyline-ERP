package com.storyline.erp.events.repository;

import com.storyline.erp.events.entity.VendorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorAssignmentRepository extends JpaRepository<VendorAssignment, Long> {
    List<VendorAssignment> findByEventId(Long eventId);
}
