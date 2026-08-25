package com.storyline.erp.events.repository;

import com.storyline.erp.events.entity.EventDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventDocumentRepository extends JpaRepository<EventDocument, Long> {
    List<EventDocument> findByEventId(Long eventId);
}
