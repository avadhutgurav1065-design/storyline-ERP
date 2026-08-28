package com.storyline.erp.common.event;

import org.springframework.context.ApplicationEvent;
import java.math.BigDecimal;

public class HamperIssuedEvent extends ApplicationEvent {

    private final Long eventId;
    private final String productName;
    private final Integer quantity;
    private final BigDecimal totalCost;

    public HamperIssuedEvent(Object source, Long eventId, String productName, Integer quantity, BigDecimal totalCost) {
        super(source);
        this.eventId = eventId;
        this.productName = productName;
        this.quantity = quantity;
        this.totalCost = totalCost;
    }

    public Long getEventId() { return eventId; }
    public String getProductName() { return productName; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getTotalCost() { return totalCost; }
}
