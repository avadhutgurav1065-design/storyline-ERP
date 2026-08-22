package com.storyline.erp.crm.repository;

import com.storyline.erp.crm.entity.Lead;
import com.storyline.erp.crm.entity.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    @Query("SELECT l FROM Lead l WHERE " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:assignedTo IS NULL OR l.assignedToUserId = :assignedTo) AND " +
           "(LOWER(l.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.company) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Lead> searchLeads(@Param("search") String search,
                           @Param("status") LeadStatus status,
                           @Param("assignedTo") Long assignedTo,
                           Pageable pageable);
                           
    long countByStatus(LeadStatus status);
}
