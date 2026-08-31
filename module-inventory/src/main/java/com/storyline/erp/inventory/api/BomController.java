package com.storyline.erp.inventory.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.inventory.dto.BillOfMaterialDto;
import com.storyline.erp.inventory.service.BomService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EVENT_MANAGER')")
public class BomController {

    private final BomService bomService;

    public BomController(BomService bomService) {
        this.bomService = bomService;
    }

    @GetMapping("/products/{productId}/bom")
    public ApiResponse<List<BillOfMaterialDto>> getProductBom(@PathVariable Long productId) {
        return ApiResponse.success(bomService.getProductBom(productId));
    }

    @PostMapping("/products/{productId}/bom")
    public ApiResponse<BillOfMaterialDto> addBomItem(@PathVariable Long productId, @RequestBody BillOfMaterialDto dto) {
        return ApiResponse.success("BOM item added successfully", bomService.addBomItem(productId, dto));
    }

    @DeleteMapping("/bom/{bomId}")
    public ApiResponse<Void> removeBomItem(@PathVariable Long bomId) {
        bomService.removeBomItem(bomId);
        return ApiResponse.success((Void) null, "BOM item removed successfully");
    }
}
