package com.storyline.erp.finance.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentDto(
        Long id,
        String paymentReference,
        Long invoiceId,
        @NotNull(message = "Client ID is required") Long clientId,
        @NotNull(message = "Amount is required") @Positive BigDecimal amount,
        @NotNull(message = "Payment Date is required") LocalDate paymentDate,
        @NotNull(message = "Payment Method is required") String paymentMethod,
        String transactionId,
        String notes
) {}
