package com.storyline.erp.finance.repository;

import com.storyline.erp.finance.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentReference(String paymentReference);
    Page<Payment> findByClientId(Long clientId, Pageable pageable);
    List<Payment> findByInvoiceId(Long invoiceId);
}
