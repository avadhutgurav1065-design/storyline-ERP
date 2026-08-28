package com.storyline.erp.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record RawMaterialDto(
        Long id,
        @NotBlank(message = "SKU is required") String sku,
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Unit of measure is required") String unitOfMeasure,
        @PositiveOrZero(message = "Current stock cannot be negative") Double currentStock,
        @PositiveOrZero(message = "Minimum stock cannot be negative") Double minimumStock,
        @PositiveOrZero(message = "Unit cost cannot be negative") Double unitCost
) {}
