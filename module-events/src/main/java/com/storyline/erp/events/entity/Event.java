package com.storyline.erp.events.entity;

import com.storyline.erp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "events")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Event extends AuditableEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private String venue;

    private Integer pax;

    @Column(name = "quotation_id")
    private Long quotationId; // Links to Sales Module

    @Column(name = "client_id")
    private Long clientId; // Links to CRM Module

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.PLANNING;

    private Integer progress = 0; // 0 to 100

    @Column(length = 2000)
    private String notes;

    @Column(name = "assigned_team_id")
    private Long assignedTeamId;

    @Column(name = "event_head_id")
    private Long eventHeadId;

    @Column(name = "budget")
    private java.math.BigDecimal budget = java.math.BigDecimal.ZERO;

    // Getters and Setters

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public Integer getPax() { return pax; }
    public void setPax(Integer pax) { this.pax = pax; }
    public Long getQuotationId() { return quotationId; }
    public void setQuotationId(Long quotationId) { this.quotationId = quotationId; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getAssignedTeamId() { return assignedTeamId; }
    public void setAssignedTeamId(Long assignedTeamId) { this.assignedTeamId = assignedTeamId; }
    public Long getEventHeadId() { return eventHeadId; }
    public void setEventHeadId(Long eventHeadId) { this.eventHeadId = eventHeadId; }
    public java.math.BigDecimal getBudget() { return budget; }
    public void setBudget(java.math.BigDecimal budget) { this.budget = budget; }
}
