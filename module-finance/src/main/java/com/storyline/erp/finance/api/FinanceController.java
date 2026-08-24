package com.storyline.erp.finance.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.finance.dto.*;
import com.storyline.erp.finance.entity.InvoiceStatus;
import com.storyline.erp.finance.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    // --- INVOICES ---
    @GetMapping("/invoices")
    public ApiResponse<PageResponse<InvoiceDto>> getInvoices(Pageable pageable) {
        return ApiResponse.success(PageResponse.of(financeService.getInvoices(pageable)));
    }

    @PostMapping("/invoices")
    public ApiResponse<InvoiceDto> createInvoice(@Valid @RequestBody InvoiceDto dto) {
        return ApiResponse.success("Invoice created successfully", financeService.createInvoice(dto));
    }

    @PatchMapping("/invoices/{id}/status")
    public ApiResponse<InvoiceDto> updateInvoiceStatus(@PathVariable Long id, @RequestParam InvoiceStatus status) {
        return ApiResponse.success("Invoice status updated", financeService.updateInvoiceStatus(id, status));
    }

    // --- PAYMENTS ---
    @GetMapping("/payments")
    public ApiResponse<PageResponse<PaymentDto>> getPayments(Pageable pageable) {
        return ApiResponse.success(PageResponse.of(financeService.getPayments(pageable)));
    }

    @PostMapping("/payments")
    public ApiResponse<PaymentDto> createPayment(@Valid @RequestBody PaymentDto dto) {
        return ApiResponse.success("Payment recorded successfully", financeService.createPayment(dto));
    }

    // --- EXPENSES ---
    @GetMapping("/expenses")
    public ApiResponse<PageResponse<ExpenseDto>> getExpenses(Pageable pageable) {
        return ApiResponse.success(PageResponse.of(financeService.getExpenses(pageable)));
    }

    @PostMapping("/expenses")
    public ApiResponse<ExpenseDto> createExpense(@Valid @RequestBody ExpenseDto dto) {
        return ApiResponse.success("Expense recorded successfully", financeService.createExpense(dto));
    }

    // --- PROFIT & LOSS ---
    @GetMapping("/profit-loss")
    public ApiResponse<ProfitLossDto> getProfitAndLoss() {
        return ApiResponse.success(financeService.getProfitAndLoss());
    }
}
