package com.storyline.erp.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DispatchLogDto(
    Long id,
    Long eventId,
    Long productId,
    String productName,
    BigDecimal quantity,
    String notes,
    LocalDateTime createdAt
) {}
