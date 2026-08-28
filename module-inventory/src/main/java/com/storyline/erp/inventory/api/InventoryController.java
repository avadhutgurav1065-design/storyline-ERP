package com.storyline.erp.inventory.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.inventory.entity.BillOfMaterial;
import com.storyline.erp.inventory.entity.Product;
import com.storyline.erp.inventory.entity.RawMaterial;
import com.storyline.erp.inventory.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // --- Products ---
    @GetMapping("/products")
    public ApiResponse<List<Product>> listProducts() {
        return ApiResponse.success(inventoryService.listProducts());
    }

    @PostMapping("/products")
    public ApiResponse<Product> createProduct(@RequestBody Product p) {
        return ApiResponse.success(inventoryService.createProduct(p));
    }

    @PutMapping("/products/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @RequestBody Product p) {
        return ApiResponse.success(inventoryService.updateProduct(id, p));
    }

    // --- Raw Materials ---
    @GetMapping("/materials")
    public ApiResponse<List<RawMaterial>> listMaterials() {
        return ApiResponse.success(inventoryService.listRawMaterials());
    }

    @PostMapping("/materials")
    public ApiResponse<RawMaterial> createMaterial(@RequestBody RawMaterial rm) {
        return ApiResponse.success(inventoryService.createRawMaterial(rm));
    }

    @PutMapping("/materials/{id}")
    public ApiResponse<RawMaterial> updateMaterial(@PathVariable Long id, @RequestBody RawMaterial rm) {
        return ApiResponse.success(inventoryService.updateMaterial(id, rm));
    }

    @PostMapping("/materials/{id}/add-stock")
    public ApiResponse<Void> addStock(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        BigDecimal quantity = new BigDecimal(payload.get("quantity").toString());
        String ref = (String) payload.get("reference");
        String notes = (String) payload.get("notes");
        inventoryService.addStock(id, quantity, ref, notes);
        return ApiResponse.success("Stock added", null);
    }

    // --- BOM ---
    @GetMapping("/products/{productId}/bom")
    public ApiResponse<List<BillOfMaterial>> getBom(@PathVariable Long productId) {
        return ApiResponse.success(inventoryService.getBomForProduct(productId));
    }

    @PostMapping("/products/{productId}/bom")
    public ApiResponse<BillOfMaterial> addBomItem(@PathVariable Long productId, @RequestBody Map<String, Object> payload) {
        Long rmId = Long.valueOf(payload.get("rawMaterialId").toString());
        BigDecimal qty = new BigDecimal(payload.get("quantity").toString());
        return ApiResponse.success(inventoryService.addBomItem(productId, rmId, qty));
    }

    @DeleteMapping("/bom/{bomId}")
    public ApiResponse<Void> removeBomItem(@PathVariable Long bomId) {
        inventoryService.removeBomItem(bomId);
        return ApiResponse.success("BOM item removed", null);
    }

    @PostMapping("/products/{productId}/produce")
    public ApiResponse<Void> produceHamper(@PathVariable Long productId, @RequestBody Map<String, Object> payload) {
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        String reference = (String) payload.get("reference");
        
        try {
            inventoryService.produceHamper(productId, quantity, reference);
            return ApiResponse.success("Hamper(s) produced successfully", null);
        } catch (IllegalStateException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
    @PostMapping("/products/{productId}/issue")
    public ApiResponse<Void> issueHamperToEvent(@PathVariable Long productId, @RequestBody Map<String, Object> payload) {
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        Long eventId = Long.valueOf(payload.get("eventId").toString());
        String reference = (String) payload.get("reference");
        
        try {
            inventoryService.issueHamperToEvent(productId, quantity, eventId, reference);
            return ApiResponse.success("Hamper(s) issued to event successfully", null);
        } catch (IllegalStateException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}
