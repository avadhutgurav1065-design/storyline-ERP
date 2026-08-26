package com.storyline.erp.crm.dto;

import jakarta.validation.constraints.NotBlank;

public record ClientDto(
        Long id,
        @NotBlank String name,
        String email,
        @NotBlank String phone,
        String company,
        String address,
        String gstNumber,
        String eventType,
        String description,
        Long convertedFromLeadId
) {}
