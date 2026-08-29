package com.storyline.erp.inventory.repository;

import com.storyline.erp.inventory.entity.DispatchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispatchLogRepository extends JpaRepository<DispatchLog, Long> {
    List<DispatchLog> findByEventId(Long eventId);
}
