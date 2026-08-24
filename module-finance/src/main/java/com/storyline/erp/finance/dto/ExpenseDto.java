package com.storyline.erp.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseDto(
        Long id,
        @NotBlank(message = "Category is required") String category,
        @NotBlank(message = "Description is required") String description,
        @NotNull(message = "Amount is required") @Positive BigDecimal amount,
        @NotNull(message = "Expense Date is required") LocalDate expenseDate,
        Long eventId,
        Long vendorId,
        String paymentMethod,
        String status
) {}
