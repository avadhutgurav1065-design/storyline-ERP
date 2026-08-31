package com.storyline.erp.events.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.events.entity.Vendor;
import com.storyline.erp.events.service.VendorService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EVENT_MANAGER', 'ROLE_TEAM_MANAGER', 'ROLE_FINANCE_MANAGER')")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping
    public ApiResponse<List<Vendor>> getAllVendors() {
        return ApiResponse.success(vendorService.getAllVendors());
    }

    @GetMapping("/{id}")
    public ApiResponse<Vendor> getVendorById(@PathVariable Long id) {
        return ApiResponse.success(vendorService.getVendorById(id));
    }

    @PostMapping
    public ApiResponse<Vendor> createVendor(@RequestBody Vendor vendor) {
        return ApiResponse.success("Vendor created", vendorService.createVendor(vendor));
    }

    @PutMapping("/{id}")
    public ApiResponse<Vendor> updateVendor(@PathVariable Long id, @RequestBody Vendor vendor) {
        return ApiResponse.success("Vendor updated", vendorService.updateVendor(id, vendor));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ApiResponse.success((Void) null, "Vendor deleted");
    }
}
