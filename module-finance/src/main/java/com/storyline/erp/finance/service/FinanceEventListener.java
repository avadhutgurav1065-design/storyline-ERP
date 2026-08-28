package com.storyline.erp.finance.service;

import com.storyline.erp.common.event.HamperIssuedEvent;
import com.storyline.erp.finance.entity.Expense;
import com.storyline.erp.finance.entity.ExpenseCategory;
import com.storyline.erp.finance.entity.ExpenseStatus;
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
    public void handleHamperIssued(HamperIssuedEvent event) {
        Expense expense = new Expense();
        expense.setEventId(event.getEventId());
        expense.setTitle("Hamper Issue: " + event.getProductName() + " (Qty: " + event.getQuantity() + ")");
        expense.setDescription("Automatic expense generated for hamper consumption.");
        expense.setCategory(ExpenseCategory.HAMPERS);
        expense.setAmount(event.getTotalCost());
        expense.setStatus(ExpenseStatus.PAID); // Automatically paid since it's internally produced
        expense.setClientBillable(false);
        expenseRepository.save(expense);
    }
}
