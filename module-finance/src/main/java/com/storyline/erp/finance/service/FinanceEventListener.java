package com.storyline.erp.finance.service;

import com.storyline.erp.finance.entity.Expense;
import com.storyline.erp.finance.repository.ExpenseRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class FinanceEventListener {

    private final ExpenseRepository expenseRepository;

    public FinanceEventListener(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
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
}
