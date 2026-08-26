package com.storyline.erp.crm.entity;

import com.storyline.erp.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "clients")
public class Client extends AuditableEntity {

    @Column(nullable = false)
    private String name;

    private String email;

    @Column(nullable = false)
    private String phone;

    private String company;

    private String address;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "event_type")
    private String eventType;

    private String description;

    @Column(name = "converted_from_lead_id")
    private Long convertedFromLeadId;

    // Getters and Setters

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getConvertedFromLeadId() { return convertedFromLeadId; }
    public void setConvertedFromLeadId(Long convertedFromLeadId) { this.convertedFromLeadId = convertedFromLeadId; }
}
