package com.storyline.erp.finance.service;

import com.storyline.erp.common.event.QuotationApprovedEvent;
import com.storyline.erp.finance.dto.InvoiceDto;
import com.storyline.erp.finance.entity.InvoiceStatus;
import com.storyline.erp.finance.entity.Expense;
import com.storyline.erp.finance.repository.ExpenseRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class FinanceEventListener {

    private final ExpenseRepository expenseRepository;
    private final FinanceService financeService;

    public FinanceEventListener(ExpenseRepository expenseRepository, FinanceService financeService) {
        this.expenseRepository = expenseRepository;
        this.financeService = financeService;
    }

    @EventListener
    public void handleHamperIssued(com.storyline.erp.common.event.HamperIssuedEvent event) {
        Expense expense = new Expense();
        expense.setEventId(event.getEventId());
        expense.setDescription("Hamper Issue: " + event.getProductName() + " (Qty: " + event.getQuantity() + ") - Automatic expense generated for hamper consumption.");
        expense.setCategory("HAMPERS");
        expense.setAmount(event.getTotalCost());
        expense.setStatus("PAID"); // Automatically paid since it's internally produced
        expense.setExpenseDate(java.time.LocalDate.now());
        expense.setClientBillable(false);
        expenseRepository.save(expense);
    }

    @EventListener
    public void handleQuotationApproved(QuotationApprovedEvent eventData) {
        // Automatically scaffold an Invoice in DRAFT status
        // Employees can edit this DRAFT invoice before sending it
        InvoiceDto dto = new InvoiceDto(
            null, // id
            "INV-AUTO-" + System.currentTimeMillis(), // invoiceNumber
            eventData.clientId(), // clientId
            null, // eventId
            eventData.quotationId(), // quotationId
            LocalDate.now(), // issueDate
            eventData.eventDate() != null ? eventData.eventDate() : LocalDate.now().plusDays(30), // dueDate
            InvoiceStatus.DRAFT, // status
            eventData.totalAmount() != null ? eventData.totalAmount() : java.math.BigDecimal.ZERO, // totalAmount
            eventData.taxAmount() != null ? eventData.taxAmount() : java.math.BigDecimal.ZERO, // taxAmount
            eventData.grandTotal() != null ? eventData.grandTotal() : java.math.BigDecimal.ZERO, // grandTotal
            java.math.BigDecimal.ZERO, // amountPaid
            "Generated automatically from approved quotation #" + eventData.quotationId(), // notes
            "Invoice for Quotation #" + eventData.quotationId() // title
        );
        
        financeService.createInvoice(dto);
    }
}
