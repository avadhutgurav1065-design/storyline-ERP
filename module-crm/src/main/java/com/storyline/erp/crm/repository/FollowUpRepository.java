package com.storyline.erp.crm.repository;

import com.storyline.erp.crm.entity.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    
    List<FollowUp> findByLeadIdOrderByInteractionDateDesc(Long leadId);
    
    List<FollowUp> findByClientIdOrderByInteractionDateDesc(Long clientId);
    
    List<FollowUp> findByNextFollowUpDateBetweenAndPerformedByUserId(
            LocalDateTime start, LocalDateTime end, Long userId);
}
