package com.storyline.erp.inventory.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.inventory.dto.DispatchRequestDto;
import com.storyline.erp.inventory.service.DispatchService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/dispatch")
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
}
