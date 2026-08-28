package com.storyline.erp.finance.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.finance.dto.*;
import com.storyline.erp.finance.entity.*;
import com.storyline.erp.finance.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FinanceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final PettyCashTransactionRepository pettyCashTransactionRepository;

    public FinanceService(InvoiceRepository invoiceRepository, PaymentRepository paymentRepository, ExpenseRepository expenseRepository, PettyCashTransactionRepository pettyCashTransactionRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.expenseRepository = expenseRepository;
        this.pettyCashTransactionRepository = pettyCashTransactionRepository;
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

    public List<InvoiceDto> createInvoiceSchedule(List<InvoiceDto> dtos) {
        return dtos.stream().map(this::createInvoice).toList();
    }
    
    public InvoiceDto updateInvoiceStatus(Long id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        invoice.setStatus(status);
        return mapToDto(invoiceRepository.save(invoice));
    }

    public InvoiceDto updateInvoice(Long id, InvoiceDto dto) {
        Invoice invoice = invoiceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Cannot edit a paid invoice.");
        }
        updateInvoiceFromDto(invoice, dto);
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
        payment.setEventId(dto.eventId());
        payment.setReceivedBy(dto.receivedBy());

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
            expense.setStatus(dto.vendorId() != null ? "PO_GENERATED" : "PAID");
        }
        
        if (dto.vendorId() != null && (dto.poNumber() == null || dto.poNumber().isEmpty())) {
            expense.setPoNumber("PO-" + System.currentTimeMillis());
        }

        return mapToDto(expenseRepository.save(expense));
    }

    public ExpenseDto updateExpenseStatus(Long id, String status, String notes) {
        Expense expense = expenseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        
        if ("APPROVED_FOR_PAYMENT".equals(status)) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("SCOPE_ALL"));
            
            boolean isFinance = auth != null && auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_FINANCE_MANAGER"));
            
            boolean isEventManager = auth != null && auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_EVENT_MANAGER"));
                    
            BigDecimal totalAmount = expense.getAmount().add(expense.getTaxAmount() != null ? expense.getTaxAmount() : BigDecimal.ZERO);
            
            if (!isAdmin && !isFinance) {
                if (isEventManager) {
                    if (totalAmount.compareTo(new BigDecimal("100000")) >= 0) {
                        throw new IllegalStateException("Event Managers cannot approve expenses of ₹1,00,000 or more. Finance Manager approval required.");
                    }
                } else {
                    throw new IllegalStateException("You do not have permission to approve expenses.");
                }
            }
        }
        
        expense.setStatus(status);
        if (notes != null && !notes.isEmpty()) {
            expense.setApprovalNotes(expense.getApprovalNotes() != null ? expense.getApprovalNotes() + "\n" + notes : notes);
        }
        return mapToDto(expenseRepository.save(expense));
    }

    public ExpenseDto updateExpense(Long id, ExpenseDto dto) {
        Expense expense = expenseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if ("PAID".equals(expense.getStatus())) {
            throw new IllegalStateException("Cannot edit a paid expense/PO.");
        }
        updateExpenseFromDto(expense, dto);
        return mapToDto(expenseRepository.save(expense));
    }

    public ExpenseDto payExpense(Long id, BigDecimal amount) {
        Expense expense = expenseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expense.setAmountPaid(expense.getAmountPaid().add(amount));
        
        BigDecimal totalDue = expense.getAmount().add(expense.getTaxAmount());
        if (expense.getAmountPaid().compareTo(totalDue) >= 0) {
            expense.setStatus("PAID");
        } else if (expense.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            expense.setStatus("PARTIALLY_PAID");
        }
        
        return mapToDto(expenseRepository.save(expense));
    }

    // ==========================================
    // PROFIT & LOSS
    // ==========================================
    public ProfitLossDto getProfitAndLoss() {
        List<Payment> allPayments = paymentRepository.findAll();
        List<Expense> allExpenses = expenseRepository.findAll();
        List<Invoice> allInvoices = invoiceRepository.findAll();

        BigDecimal totalRevenue = allPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal outstandingReceivables = allInvoices.stream()
                .filter(i -> i.getStatus() != InvoiceStatus.CANCELLED && i.getStatus() != InvoiceStatus.PROFORMA)
                .map(i -> {
                    BigDecimal total = i.getGrandTotal() != null ? i.getGrandTotal() : BigDecimal.ZERO;
                    BigDecimal paid = i.getAmountPaid() != null ? i.getAmountPaid() : BigDecimal.ZERO;
                    return total.subtract(paid);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal directEventCosts = allExpenses.stream()
                .filter(e -> e.getEventId() != null)
                .map(e -> e.getAmount().add(e.getTaxAmount() != null ? e.getTaxAmount() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal companyOverheads = allExpenses.stream()
                .filter(e -> e.getEventId() == null)
                .map(e -> e.getAmount().add(e.getTaxAmount() != null ? e.getTaxAmount() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal grossProfit = totalRevenue.subtract(directEventCosts);
        BigDecimal netProfit = grossProfit.subtract(companyOverheads);

        java.time.LocalDate today = java.time.LocalDate.now();
        BigDecimal agingCurrent = BigDecimal.ZERO;
        BigDecimal aging1to7 = BigDecimal.ZERO;
        BigDecimal aging8to30 = BigDecimal.ZERO;
        BigDecimal agingOver30 = BigDecimal.ZERO;

        for (Invoice i : allInvoices) {
            if (i.getStatus() != InvoiceStatus.CANCELLED && i.getStatus() != InvoiceStatus.PROFORMA) {
                BigDecimal balance = (i.getGrandTotal() != null ? i.getGrandTotal() : BigDecimal.ZERO)
                        .subtract(i.getAmountPaid() != null ? i.getAmountPaid() : BigDecimal.ZERO);
                
                if (balance.compareTo(BigDecimal.ZERO) > 0 && i.getDueDate() != null) {
                    long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(i.getDueDate(), today);
                    if (daysOverdue <= 0) agingCurrent = agingCurrent.add(balance);
                    else if (daysOverdue <= 7) aging1to7 = aging1to7.add(balance);
                    else if (daysOverdue <= 30) aging8to30 = aging8to30.add(balance);
                    else agingOver30 = agingOver30.add(balance);
                } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
                    agingCurrent = agingCurrent.add(balance); // No due date, assume current
                }
            }
        }

        BigDecimal todaysCollections = allPayments.stream()
                .filter(p -> p.getPaymentDate() != null && p.getPaymentDate().isEqual(today))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ProfitLossDto(totalRevenue, directEventCosts, grossProfit, companyOverheads, netProfit, outstandingReceivables,
                agingCurrent, aging1to7, aging8to30, agingOver30, todaysCollections);
    }

    public ProfitLossDto getEventProfitAndLoss(Long eventId) {
        List<Payment> allPayments = paymentRepository.findAll();
        List<Expense> allExpenses = expenseRepository.findAll();
        List<Invoice> allInvoices = invoiceRepository.findAll();

        BigDecimal eventRevenue = allPayments.stream()
                .filter(p -> eventId.equals(p.getEventId()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal eventDirectCosts = allExpenses.stream()
                .filter(e -> eventId.equals(e.getEventId()))
                .map(e -> e.getAmount().add(e.getTaxAmount() != null ? e.getTaxAmount() : BigDecimal.ZERO))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal eventProfit = eventRevenue.subtract(eventDirectCosts);

        BigDecimal outstandingReceivables = allInvoices.stream()
                .filter(i -> eventId.equals(i.getEventId()))
                .filter(i -> i.getStatus() != InvoiceStatus.CANCELLED && i.getStatus() != InvoiceStatus.PROFORMA)
                .map(i -> {
                    BigDecimal total = i.getGrandTotal() != null ? i.getGrandTotal() : BigDecimal.ZERO;
                    BigDecimal paid = i.getAmountPaid() != null ? i.getAmountPaid() : BigDecimal.ZERO;
                    return total.subtract(paid);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // For event P&L, company overheads and net profit are not applicable (or 0)
        return new ProfitLossDto(eventRevenue, eventDirectCosts, eventProfit, BigDecimal.ZERO, eventProfit, outstandingReceivables,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    // ==========================================
    // PETTY CASH
    // ==========================================
    public Page<PettyCashTransactionDto> getPettyCashTransactions(Pageable pageable) {
        return pettyCashTransactionRepository.findAll(pageable).map(this::mapToDto);
    }

    public PettyCashTransactionDto recordPettyCashTransaction(PettyCashTransactionDto dto) {
        PettyCashTransaction tx = new PettyCashTransaction();
        tx.setTransactionType(dto.transactionType());
        tx.setAmount(dto.amount());
        tx.setDescription(dto.description());
        tx.setTransactionDate(dto.transactionDate() != null ? dto.transactionDate() : java.time.LocalDate.now());
        tx.setRecordedBy(dto.recordedBy());
        return mapToDto(pettyCashTransactionRepository.save(tx));
    }

    public BigDecimal getPettyCashBalance() {
        return pettyCashTransactionRepository.findAll().stream()
                .map(tx -> "DEPOSIT".equals(tx.getTransactionType()) ? tx.getAmount() : tx.getAmount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ==========================================
    // MAPPERS
    // ==========================================
    private InvoiceDto mapToDto(Invoice invoice) {
        return new InvoiceDto(
                invoice.getId(), invoice.getInvoiceNumber(), invoice.getClientId(), invoice.getEventId(),
                invoice.getQuotationId(), invoice.getIssueDate(), invoice.getDueDate(), invoice.getStatus(),
                invoice.getTotalAmount(), invoice.getTaxAmount(), invoice.getGrandTotal(), invoice.getAmountPaid(), invoice.getNotes(),
                invoice.getTitle()
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
        invoice.setTitle(dto.title());
    }

    private PaymentDto mapToDto(Payment payment) {
        return new PaymentDto(
                payment.getId(), payment.getPaymentReference(), payment.getInvoiceId(), payment.getClientId(),
                payment.getAmount(), payment.getPaymentDate(), payment.getPaymentMethod(), payment.getTransactionId(), payment.getNotes(),
                payment.getEventId(), payment.getReceivedBy()
        );
    }

    private ExpenseDto mapToDto(Expense expense) {
        return new ExpenseDto(
                expense.getId(), expense.getCategory(), expense.getDescription(), expense.getAmount(),
                expense.getExpenseDate(), expense.getEventId(), expense.getVendorId(), expense.getPaymentMethod(), expense.getStatus(),
                expense.getPoNumber(), expense.getTaxAmount(), expense.getAmountPaid(), expense.getApprovalNotes(),
                expense.getClientBillable()
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
        if (dto.poNumber() != null) expense.setPoNumber(dto.poNumber());
        if (dto.taxAmount() != null) expense.setTaxAmount(dto.taxAmount());
        if (dto.amountPaid() != null) expense.setAmountPaid(dto.amountPaid());
        if (dto.approvalNotes() != null) expense.setApprovalNotes(dto.approvalNotes());
        if (dto.clientBillable() != null) expense.setClientBillable(dto.clientBillable());
    }

    private PettyCashTransactionDto mapToDto(PettyCashTransaction tx) {
        return new PettyCashTransactionDto(
                tx.getId(), tx.getTransactionType(), tx.getAmount(), tx.getDescription(),
                tx.getTransactionDate(), tx.getRecordedBy()
        );
    }
}
