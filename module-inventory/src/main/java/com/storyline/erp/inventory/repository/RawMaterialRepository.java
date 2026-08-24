package com.storyline.erp.inventory.repository;

import com.storyline.erp.inventory.entity.RawMaterial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    Optional<RawMaterial> findBySku(String sku);
    Page<RawMaterial> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name, String sku, Pageable pageable);
}
