package com.storyline.erp.crm.dto;

import com.storyline.erp.crm.entity.InteractionType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record FollowUpDto(
        Long id,
        Long leadId,
        Long clientId,
        @NotNull InteractionType interactionType,
        String notes,
        LocalDateTime interactionDate,
        LocalDateTime nextFollowUpDate,
        Long performedByUserId
) {}
