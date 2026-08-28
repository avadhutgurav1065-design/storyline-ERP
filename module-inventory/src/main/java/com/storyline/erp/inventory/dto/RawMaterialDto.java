package com.storyline.erp.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record RawMaterialDto(
        Long id,
        @NotBlank(message = "SKU is required") String sku,
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Unit of measure is required") String unitOfMeasure,
        @PositiveOrZero(message = "Current stock cannot be negative") BigDecimal currentStock,
        @PositiveOrZero(message = "Minimum stock cannot be negative") BigDecimal minimumStock,
        @PositiveOrZero(message = "Unit cost cannot be negative") BigDecimal unitCost
) {}
