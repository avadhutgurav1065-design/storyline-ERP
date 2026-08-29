package com.storyline.erp.inventory.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.inventory.dto.ManufactureRequestDto;
import com.storyline.erp.inventory.service.ManufacturingService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/manufacturing")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_INVENTORY_MANAGER')")
public class ManufacturingController {

    private final ManufacturingService manufacturingService;

    public ManufacturingController(ManufacturingService manufacturingService) {
        this.manufacturingService = manufacturingService;
    }

    @PostMapping("/batch")
    public ApiResponse<Void> processManufactureBatch(@Valid @RequestBody ManufactureRequestDto dto) {
        manufacturingService.processManufactureBatch(dto);
        return ApiResponse.success((Void) null, "Manufacturing batch processed successfully.");
    }
}
