package com.storyline.erp.events.entity;

import com.storyline.erp.common.entity.AuditableEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "vendors")
public class Vendor extends AuditableEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "service_type")
    private String serviceType; // e.g. Catering, Decoration, Photography

    @Column(nullable = false)
    private String phone;

    private String email;

    @Column(name = "gst_number")
    private String gstNumber;

    private String address;

    @Column(name = "is_active")
    private boolean active = true;

    // Getters and Setters

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
