package com.storyline.erp.common.event;

import java.math.BigDecimal;

public class HamperIssuedEvent {
    private final Long eventId;
    private final String productName;
    private final BigDecimal quantity;
    private final BigDecimal totalCost;

    public HamperIssuedEvent(Long eventId, String productName, BigDecimal quantity, BigDecimal totalCost) {
        this.eventId = eventId;
        this.productName = productName;
        this.quantity = quantity;
        this.totalCost = totalCost;
    }

    public Long getEventId() { return eventId; }
    public String getProductName() { return productName; }
    public BigDecimal getQuantity() { return quantity; }
    public BigDecimal getTotalCost() { return totalCost; }
}
