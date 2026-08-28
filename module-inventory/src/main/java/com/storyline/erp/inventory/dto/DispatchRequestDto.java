package com.storyline.erp.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record DispatchRequestDto(
    @NotNull(message = "Event ID is required")
    Long eventId,
    
    @NotNull(message = "Items to dispatch are required")
    List<DispatchItemDto> items,
    
    String notes
) {
    public record DispatchItemDto(
        @NotNull(message = "Product ID is required")
        Long productId,
        
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        java.math.BigDecimal quantity
    ) {}
}
