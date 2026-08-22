package com.storyline.erp.inventory.entity;

import com.storyline.erp.common.entity.AuditableEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "stock_transactions")
public class StockTransaction extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id", nullable = false)
    private RawMaterial rawMaterial;

    @Column(name = "transaction_type", nullable = false)
    private String transactionType; // IN, OUT, ADJUSTMENT

    @Column(nullable = false)
    private Double quantity;

    private String reference; // e.g. PO-1234, BATCH-999

    @Column(length = 500)
    private String notes;

    // Getters and Setters
    public RawMaterial getRawMaterial() { return rawMaterial; }
    public void setRawMaterial(RawMaterial rawMaterial) { this.rawMaterial = rawMaterial; }
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
