package com.storyline.erp.sales.repository;

import com.storyline.erp.sales.entity.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    Page<Quotation> findByClientId(Long clientId, Pageable pageable);
    
    @EntityGraph(attributePaths = {"items"})
    List<Quotation> findByQuoteNumberOrderByVersionDesc(String quoteNumber);

    @EntityGraph(attributePaths = {"items"})
    Optional<Quotation> findById(Long id);
}
