package com.storyline.erp.finance.dto;

import java.math.BigDecimal;

public record ProfitLossDto(
        BigDecimal totalRevenue,
        BigDecimal directEventCosts,
        BigDecimal grossProfit,
        BigDecimal companyOverheads,
        BigDecimal netProfit,
        BigDecimal outstandingReceivables,
        BigDecimal agingCurrent,
        BigDecimal aging1to7Days,
        BigDecimal aging8to30Days,
        BigDecimal agingOver30Days,
        BigDecimal todaysCollections
) {}
