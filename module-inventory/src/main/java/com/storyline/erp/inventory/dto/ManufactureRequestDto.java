package com.storyline.erp.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ManufactureRequestDto(
        @NotNull(message = "Product ID is required") Long productId,
        @NotNull(message = "Quantity is required") @Positive(message = "Quantity must be positive") Integer quantityToManufacture
) {}
