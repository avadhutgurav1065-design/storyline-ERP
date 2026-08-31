package com.storyline.erp.inventory.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.inventory.dto.DispatchRequestDto;
import com.storyline.erp.inventory.dto.DispatchLogDto;
import com.storyline.erp.inventory.service.DispatchService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/dispatch")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EVENT_MANAGER')")
public class DispatchController {

    private final DispatchService dispatchService;

    public DispatchController(DispatchService dispatchService) {
        this.dispatchService = dispatchService;
    }

    @PostMapping
    public ApiResponse<Void> dispatchToEvent(@Valid @RequestBody DispatchRequestDto request) {
        dispatchService.dispatchToEvent(request);
        return ApiResponse.success((Void) null, "Products dispatched successfully.");
    }

    @GetMapping("/event/{eventId}")
    public ApiResponse<List<DispatchLogDto>> getDispatchLogsByEventId(@PathVariable Long eventId) {
        return ApiResponse.success("Fetched dispatch logs", dispatchService.getDispatchLogsByEventId(eventId));
    }
}
