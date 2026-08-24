package com.storyline.erp.finance.dto;

import java.math.BigDecimal;

public record ProfitLossDto(
        BigDecimal totalRevenue,
        BigDecimal totalExpenses,
        BigDecimal netProfit
) {}
