package com.storyline.erp.finance.repository;

import com.storyline.erp.finance.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Page<Invoice> findByClientId(Long clientId, Pageable pageable);
}
