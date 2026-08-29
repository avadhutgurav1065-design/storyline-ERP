package com.storyline.erp.events.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.events.entity.VendorAssignment;
import com.storyline.erp.events.service.VendorAssignmentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/vendor-assignments")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EVENT_MANAGER', 'ROLE_EVENT_HEAD')")
public class VendorAssignmentController {

    private final VendorAssignmentService vendorAssignmentService;

    public VendorAssignmentController(VendorAssignmentService vendorAssignmentService) {
        this.vendorAssignmentService = vendorAssignmentService;
    }

    @GetMapping("/event/{eventId}")
    public ApiResponse<List<VendorAssignment>> getAssignmentsByEventId(@PathVariable Long eventId) {
        return ApiResponse.success(vendorAssignmentService.getAssignmentsByEventId(eventId));
    }

    @PostMapping
    public ApiResponse<VendorAssignment> assignVendor(@RequestBody VendorAssignment assignment) {
        return ApiResponse.success("Vendor assigned", vendorAssignmentService.assignVendor(assignment));
    }

    @PutMapping("/{id}")
    public ApiResponse<VendorAssignment> updateAssignment(@PathVariable Long id, @RequestBody VendorAssignment assignment) {
        return ApiResponse.success("Vendor assignment updated", vendorAssignmentService.updateAssignment(id, assignment));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> removeAssignment(@PathVariable Long id) {
        vendorAssignmentService.removeAssignment(id);
        return ApiResponse.success((Void) null, "Vendor assignment removed");
    }
}
