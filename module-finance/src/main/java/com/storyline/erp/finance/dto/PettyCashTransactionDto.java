package com.storyline.erp.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PettyCashTransactionDto(
        Long id,
        @NotBlank(message = "Transaction type is required (DEPOSIT/WITHDRAWAL)") String transactionType,
        @NotNull(message = "Amount is required") @Positive BigDecimal amount,
        @NotBlank(message = "Description is required") String description,
        @NotNull(message = "Transaction Date is required") @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd") LocalDate transactionDate,
        String recordedBy
) {}
