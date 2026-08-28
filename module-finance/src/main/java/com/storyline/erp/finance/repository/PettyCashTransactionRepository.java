package com.storyline.erp.finance.repository;

import com.storyline.erp.finance.entity.PettyCashTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PettyCashTransactionRepository extends JpaRepository<PettyCashTransaction, Long> {
    List<PettyCashTransaction> findByTransactionDateBetweenOrderByTransactionDateDesc(LocalDate startDate, LocalDate endDate);
}
