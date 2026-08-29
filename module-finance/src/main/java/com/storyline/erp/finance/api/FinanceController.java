package com.storyline.erp.finance.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.finance.dto.*;
import com.storyline.erp.finance.entity.InvoiceStatus;
import com.storyline.erp.finance.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/finance")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_FINANCE_MANAGER')")
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

    @PostMapping("/invoices/schedule")
    public ApiResponse<java.util.List<InvoiceDto>> createInvoiceSchedule(@Valid @RequestBody java.util.List<InvoiceDto> dtos) {
        return ApiResponse.success("Invoice schedule created successfully", financeService.createInvoiceSchedule(dtos));
    }

    @PatchMapping("/invoices/{id}/status")
    public ApiResponse<InvoiceDto> updateInvoiceStatus(@PathVariable Long id, @RequestParam InvoiceStatus status) {
        return ApiResponse.success("Invoice status updated", financeService.updateInvoiceStatus(id, status));
    }

    @PutMapping("/invoices/{id}")
    public ApiResponse<InvoiceDto> updateInvoice(@PathVariable Long id, @Valid @RequestBody InvoiceDto dto) {
        return ApiResponse.success("Invoice updated successfully", financeService.updateInvoice(id, dto));
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

    @PatchMapping("/expenses/{id}/status")
    public ApiResponse<ExpenseDto> updateExpenseStatus(@PathVariable Long id, @RequestParam String status, @RequestParam(required = false) String notes) {
        return ApiResponse.success("Expense status updated", financeService.updateExpenseStatus(id, status, notes));
    }

    @PutMapping("/expenses/{id}")
    public ApiResponse<ExpenseDto> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseDto dto) {
        return ApiResponse.success("Expense updated successfully", financeService.updateExpense(id, dto));
    }

    @PostMapping("/expenses/{id}/pay")
    public ApiResponse<ExpenseDto> payExpense(@PathVariable Long id, @RequestParam java.math.BigDecimal amount) {
        return ApiResponse.success("Vendor payment recorded", financeService.payExpense(id, amount));
    }

    // --- PROFIT & LOSS ---
    @GetMapping("/profit-loss")
    public ApiResponse<ProfitLossDto> getProfitAndLoss() {
        return ApiResponse.success(financeService.getProfitAndLoss());
    }

    @GetMapping("/events/{eventId}/profit-loss")
    public ApiResponse<ProfitLossDto> getEventProfitAndLoss(@PathVariable Long eventId) {
        return ApiResponse.success(financeService.getEventProfitAndLoss(eventId));
    }

    // --- PETTY CASH ---
    @GetMapping("/petty-cash")
    public ApiResponse<PageResponse<PettyCashTransactionDto>> getPettyCashTransactions(Pageable pageable) {
        return ApiResponse.success(PageResponse.of(financeService.getPettyCashTransactions(pageable)));
    }

    @PostMapping("/petty-cash")
    public ApiResponse<PettyCashTransactionDto> recordPettyCashTransaction(@Valid @RequestBody PettyCashTransactionDto dto) {
        return ApiResponse.success("Petty cash transaction recorded", financeService.recordPettyCashTransaction(dto));
    }

    @GetMapping("/petty-cash/balance")
    public ApiResponse<java.math.BigDecimal> getPettyCashBalance() {
        return ApiResponse.success(financeService.getPettyCashBalance());
    }
}
