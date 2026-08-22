package com.storyline.erp.sales.repository;

import com.storyline.erp.sales.entity.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    Page<Quotation> findByClientId(Long clientId, Pageable pageable);
    
    List<Quotation> findByQuoteNumberOrderByVersionDesc(String quoteNumber);
}
