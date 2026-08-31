package com.storyline.erp.events.entity;

import com.storyline.erp.common.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "team_assignments")
public class TeamAssignment extends BaseEntity {

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "user_id", nullable = false)
    private Long userId; // Link to Identity module

    @Column(nullable = false)
    private String role; // EVENT_HEAD, DECORATION_HEAD, TEAM_MEMBER
    
    private String department;
    
    @Column(name = "is_head")
    private Boolean isHead = false;

    // Getters and Setters

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Boolean getIsHead() { return isHead; }
    public void setIsHead(Boolean isHead) { this.isHead = isHead; }
}
