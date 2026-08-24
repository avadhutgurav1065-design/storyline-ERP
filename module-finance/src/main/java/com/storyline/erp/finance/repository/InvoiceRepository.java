package com.storyline.erp.finance.repository;

import com.storyline.erp.finance.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Page<Invoice> findByClientId(Long clientId, Pageable pageable);
    Page<Invoice> findByEventId(Long eventId, Pageable pageable);
}
