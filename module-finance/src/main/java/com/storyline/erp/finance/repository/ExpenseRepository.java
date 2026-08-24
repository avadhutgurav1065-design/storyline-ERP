package com.storyline.erp.finance.repository;

import com.storyline.erp.finance.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByCategory(String category, Pageable pageable);
    List<Expense> findByEventId(Long eventId);
    Page<Expense> findByVendorId(Long vendorId, Pageable pageable);
}
