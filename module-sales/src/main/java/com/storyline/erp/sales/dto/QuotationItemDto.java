package com.storyline.erp.sales.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record QuotationItemDto(
        Long id,
        String groupName,
        @NotBlank String description,
        @NotNull BigDecimal quantity,
        @NotNull BigDecimal unitPrice,
        BigDecimal taxPercent,
        BigDecimal total
) {}
