package com.storyline.erp.inventory.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.inventory.dto.RawMaterialDto;
import com.storyline.erp.inventory.service.RawMaterialService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/raw-materials")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_INVENTORY_MANAGER')")
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    public RawMaterialController(RawMaterialService rawMaterialService) {
        this.rawMaterialService = rawMaterialService;
    }

    @GetMapping
    public ApiResponse<PageResponse<RawMaterialDto>> searchRawMaterials(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<RawMaterialDto> rawMaterials = rawMaterialService.searchRawMaterials(search, pageable);
        return ApiResponse.success(PageResponse.of(rawMaterials));
    }

    @GetMapping("/{id}")
    public ApiResponse<RawMaterialDto> getRawMaterial(@PathVariable Long id) {
        return ApiResponse.success(rawMaterialService.getRawMaterial(id));
    }

    @PostMapping
    public ApiResponse<RawMaterialDto> createRawMaterial(@Valid @RequestBody RawMaterialDto dto) {
        return ApiResponse.success("Raw material created successfully", rawMaterialService.createRawMaterial(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<RawMaterialDto> updateRawMaterial(@PathVariable Long id, @Valid @RequestBody RawMaterialDto dto) {
        return ApiResponse.success("Raw material updated successfully", rawMaterialService.updateRawMaterial(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRawMaterial(@PathVariable Long id) {
        rawMaterialService.deleteRawMaterial(id);
        return ApiResponse.success((Void) null, "Raw material deleted successfully");
    }

    @PostMapping("/{id}/stock")
    public ApiResponse<RawMaterialDto> updateStock(
            @PathVariable Long id,
            @RequestParam java.math.BigDecimal quantity,
            @RequestParam String type,
            @RequestParam(required = false) String reference,
            @RequestParam(required = false) String notes) {
        return ApiResponse.success("Stock updated successfully", rawMaterialService.updateStock(id, quantity, type, reference, notes));
    }
}
