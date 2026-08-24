package com.storyline.erp.finance.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.finance.dto.*;
import com.storyline.erp.finance.entity.*;
import com.storyline.erp.finance.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FinanceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;

    public FinanceService(InvoiceRepository invoiceRepository, PaymentRepository paymentRepository, ExpenseRepository expenseRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.expenseRepository = expenseRepository;
    }

    // ==========================================
    // INVOICES
    // ==========================================
    public Page<InvoiceDto> getInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::mapToDto);
    }

    public InvoiceDto createInvoice(InvoiceDto dto) {
        Invoice invoice = new Invoice();
        String invoiceNumber = "INV-" + System.currentTimeMillis();
        invoice.setInvoiceNumber(invoiceNumber);
        updateInvoiceFromDto(invoice, dto);
        return mapToDto(invoiceRepository.save(invoice));
    }
    
    public InvoiceDto updateInvoiceStatus(Long id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        invoice.setStatus(status);
        return mapToDto(invoiceRepository.save(invoice));
    }

    // ==========================================
    // PAYMENTS
    // ==========================================
    public Page<PaymentDto> getPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(this::mapToDto);
    }

    public PaymentDto createPayment(PaymentDto dto) {
        Payment payment = new Payment();
        payment.setPaymentReference("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setInvoiceId(dto.invoiceId());
        payment.setClientId(dto.clientId());
        payment.setAmount(dto.amount());
        payment.setPaymentDate(dto.paymentDate());
        payment.setPaymentMethod(dto.paymentMethod());
        payment.setTransactionId(dto.transactionId());
        payment.setNotes(dto.notes());

        Payment saved = paymentRepository.save(payment);

        if (dto.invoiceId() != null) {
            Invoice invoice = invoiceRepository.findById(dto.invoiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
            invoice.setAmountPaid(invoice.getAmountPaid().add(dto.amount()));
            if (invoice.getAmountPaid().compareTo(invoice.getGrandTotal()) >= 0) {
                invoice.setStatus(InvoiceStatus.PAID);
            } else if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
                invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
            }
            invoiceRepository.save(invoice);
        }

        return mapToDto(saved);
    }

    // ==========================================
    // EXPENSES
    // ==========================================
    public Page<ExpenseDto> getExpenses(Pageable pageable) {
        return expenseRepository.findAll(pageable).map(this::mapToDto);
    }

    public ExpenseDto createExpense(ExpenseDto dto) {
        Expense expense = new Expense();
        updateExpenseFromDto(expense, dto);
        if (dto.status() != null) {
            expense.setStatus(dto.status());
        } else {
            expense.setStatus("PAID");
        }
        return mapToDto(expenseRepository.save(expense));
    }

    // ==========================================
    // PROFIT & LOSS
    // ==========================================
    public ProfitLossDto getProfitAndLoss() {
        List<Payment> allPayments = paymentRepository.findAll();
        List<Expense> allExpenses = expenseRepository.findAll();

        BigDecimal totalRevenue = allPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = allExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ProfitLossDto(totalRevenue, totalExpenses, totalRevenue.subtract(totalExpenses));
    }

    // ==========================================
    // MAPPERS
    // ==========================================
    private InvoiceDto mapToDto(Invoice invoice) {
        return new InvoiceDto(
                invoice.getId(), invoice.getInvoiceNumber(), invoice.getClientId(), invoice.getEventId(),
                invoice.getQuotationId(), invoice.getIssueDate(), invoice.getDueDate(), invoice.getStatus(),
                invoice.getTotalAmount(), invoice.getTaxAmount(), invoice.getGrandTotal(), invoice.getAmountPaid(), invoice.getNotes()
        );
    }

    private void updateInvoiceFromDto(Invoice invoice, InvoiceDto dto) {
        invoice.setClientId(dto.clientId());
        invoice.setEventId(dto.eventId());
        invoice.setQuotationId(dto.quotationId());
        invoice.setIssueDate(dto.issueDate());
        invoice.setDueDate(dto.dueDate());
        if (dto.status() != null) invoice.setStatus(dto.status());
        invoice.setTotalAmount(dto.totalAmount());
        invoice.setTaxAmount(dto.taxAmount() != null ? dto.taxAmount() : BigDecimal.ZERO);
        invoice.setGrandTotal(dto.grandTotal() != null ? dto.grandTotal() : dto.totalAmount());
        invoice.setAmountPaid(dto.amountPaid() != null ? dto.amountPaid() : BigDecimal.ZERO);
        invoice.setNotes(dto.notes());
    }

    private PaymentDto mapToDto(Payment payment) {
        return new PaymentDto(
                payment.getId(), payment.getPaymentReference(), payment.getInvoiceId(), payment.getClientId(),
                payment.getAmount(), payment.getPaymentDate(), payment.getPaymentMethod(), payment.getTransactionId(), payment.getNotes()
        );
    }

    private ExpenseDto mapToDto(Expense expense) {
        return new ExpenseDto(
                expense.getId(), expense.getCategory(), expense.getDescription(), expense.getAmount(),
                expense.getExpenseDate(), expense.getEventId(), expense.getVendorId(), expense.getPaymentMethod(), expense.getStatus()
        );
    }

    private void updateExpenseFromDto(Expense expense, ExpenseDto dto) {
        expense.setCategory(dto.category());
        expense.setDescription(dto.description());
        expense.setAmount(dto.amount());
        expense.setExpenseDate(dto.expenseDate());
        expense.setEventId(dto.eventId());
        expense.setVendorId(dto.vendorId());
        expense.setPaymentMethod(dto.paymentMethod());
    }
}
