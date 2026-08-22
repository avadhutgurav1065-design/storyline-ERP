package com.storyline.erp.events.entity;

import com.storyline.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vendor_assignments")
public class VendorAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(nullable = false)
    private String task;

    @Column(name = "agreed_amount")
    private BigDecimal agreedAmount = BigDecimal.ZERO;

    private String status = "PENDING"; // PENDING, CONFIRMED, COMPLETED

    // Getters and Setters

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }
    public String getTask() { return task; }
    public void setTask(String task) { this.task = task; }
    public BigDecimal getAgreedAmount() { return agreedAmount; }
    public void setAgreedAmount(BigDecimal agreedAmount) { this.agreedAmount = agreedAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
