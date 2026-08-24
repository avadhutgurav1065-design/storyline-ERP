package com.storyline.erp.inventory.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.inventory.dto.BillOfMaterialDto;
import com.storyline.erp.inventory.service.BomService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/bom")
public class BomController {

    private final BomService bomService;

    public BomController(BomService bomService) {
        this.bomService = bomService;
    }

    @GetMapping("/product/{productId}")
    public ApiResponse<List<BillOfMaterialDto>> getProductBom(@PathVariable Long productId) {
        return ApiResponse.success(bomService.getProductBom(productId));
    }

    @PutMapping("/product/{productId}")
    public ApiResponse<List<BillOfMaterialDto>> updateProductBom(
            @PathVariable Long productId,
            @RequestBody List<BillOfMaterialDto> bomItems) {
        return ApiResponse.success("BOM updated successfully", bomService.updateProductBom(productId, bomItems));
    }
}
