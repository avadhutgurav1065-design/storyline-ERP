package com.storyline.erp.crm.dto;

import com.storyline.erp.crm.entity.LeadStatus;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LeadDto(
        Long id,
        @NotBlank String name,
        String email,
        @NotBlank String phone,
        String company,
        String eventType,
        LocalDate eventDate,
        BigDecimal budget,
        LeadStatus status,
        String source,
        Long assignedToUserId,
        String requirements,
        String eventLocation,
        String lostReason,
        Long existingClientId
) {}
