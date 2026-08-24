package com.storyline.erp.finance.dto;

import com.storyline.erp.finance.entity.InvoiceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceDto(
        Long id,
        String invoiceNumber,
        @NotNull(message = "Client ID is required") Long clientId,
        Long eventId,
        Long quotationId,
        @NotNull(message = "Issue Date is required") LocalDate issueDate,
        LocalDate dueDate,
        InvoiceStatus status,
        @NotNull(message = "Total Amount is required") @PositiveOrZero BigDecimal totalAmount,
        @PositiveOrZero BigDecimal taxAmount,
        @PositiveOrZero BigDecimal grandTotal,
        @PositiveOrZero BigDecimal amountPaid,
        String notes
) {}
