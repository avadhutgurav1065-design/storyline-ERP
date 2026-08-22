package com.storyline.erp.events.entity;

import com.storyline.erp.common.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "team_assignments")
public class TeamAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "user_id", nullable = false)
    private Long userId; // Link to Identity module

    @Column(nullable = false)
    private String role; // EVENT_HEAD, DECORATION_HEAD, TEAM_MEMBER

    // Getters and Setters

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
