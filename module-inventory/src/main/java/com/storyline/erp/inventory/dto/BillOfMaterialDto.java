package com.storyline.erp.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BillOfMaterialDto(
        Long id,
        @NotNull(message = "Product ID is required") Long productId,
        @NotNull(message = "Raw Material ID is required") Long rawMaterialId,
        String rawMaterialName, // Useful for reading
        String rawMaterialSku,
        String rawMaterialUom,
        @NotNull(message = "Quantity is required") @Positive(message = "Quantity must be positive") java.math.BigDecimal quantity
) {}
