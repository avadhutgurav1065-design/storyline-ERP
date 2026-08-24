package com.storyline.erp.inventory.repository;

import com.storyline.erp.inventory.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    Page<StockTransaction> findByRawMaterialId(Long rawMaterialId, Pageable pageable);
    Page<StockTransaction> findByProductId(Long productId, Pageable pageable);
}
