package com.storyline.erp.sales.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.sales.dto.QuotationDto;
import com.storyline.erp.sales.entity.QuotationStatus;
import com.storyline.erp.sales.service.QuotationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/sales/quotations")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EVENT_MANAGER', 'ROLE_FINANCE_MANAGER')")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @GetMapping
    public ApiResponse<PageResponse<QuotationDto>> getAllQuotations(Pageable pageable) {
        Page<QuotationDto> quotes = quotationService.getAllQuotations(pageable);
        return ApiResponse.success(PageResponse.of(quotes));
    }

    @GetMapping("/client/{clientId}")
    public ApiResponse<PageResponse<QuotationDto>> getClientQuotations(
            @PathVariable Long clientId, Pageable pageable) {
        Page<QuotationDto> quotes = quotationService.getClientQuotations(clientId, pageable);
        return ApiResponse.success(PageResponse.of(quotes));
    }

    @GetMapping("/{id}")
    public ApiResponse<QuotationDto> getQuotation(@PathVariable Long id) {
        return ApiResponse.success(quotationService.getQuotation(id));
    }

    @PostMapping
    public ApiResponse<QuotationDto> createQuotation(@Valid @RequestBody QuotationDto dto) {
        return ApiResponse.success("Quotation created", quotationService.createQuotation(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<QuotationDto> updateQuotation(@PathVariable Long id, @Valid @RequestBody QuotationDto dto) {
        return ApiResponse.success("Quotation updated", quotationService.updateQuotation(id, dto));
    }

    @PostMapping("/{id}/versions")
    public ApiResponse<QuotationDto> createNewVersion(@PathVariable Long id) {
        return ApiResponse.success("New version created", quotationService.createNewVersion(id));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<QuotationDto> updateStatus(@PathVariable Long id, @RequestParam QuotationStatus status) {
        return ApiResponse.success("Status updated to " + status, quotationService.updateStatus(id, status));
    }
}
