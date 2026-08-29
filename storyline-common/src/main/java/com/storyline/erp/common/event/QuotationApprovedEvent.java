package com.storyline.erp.common.event;

import java.math.BigDecimal;

public record QuotationApprovedEvent(
    Long quotationId,
    Long clientId,
    String eventName,
    java.time.LocalDate eventDate,
    Integer pax,
    String venue,
    BigDecimal totalAmount,
    BigDecimal taxAmount,
    BigDecimal grandTotal
) {}
