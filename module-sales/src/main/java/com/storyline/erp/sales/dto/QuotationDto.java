package com.storyline.erp.sales.dto;

import com.storyline.erp.sales.entity.QuotationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record QuotationDto(
        Long id,
        String quoteNumber,
        @NotNull Long clientId,
        @NotBlank String eventName,
        LocalDate eventDate,
        Integer pax,
        String venue,
        Integer version,
        Long parentQuotationId,
        QuotationStatus status,
        BigDecimal totalAmount,
        BigDecimal taxAmount,
        BigDecimal discountAmount,
        BigDecimal grandTotal,
        String notes,
        List<QuotationItemDto> items
) {}
