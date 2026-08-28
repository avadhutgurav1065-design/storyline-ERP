package com.storyline.erp.inventory.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.inventory.dto.ManufactureRequestDto;
import com.storyline.erp.inventory.entity.BillOfMaterial;
import com.storyline.erp.inventory.entity.Product;
import com.storyline.erp.inventory.entity.RawMaterial;
import com.storyline.erp.inventory.entity.StockTransaction;
import com.storyline.erp.inventory.repository.BillOfMaterialRepository;
import com.storyline.erp.inventory.repository.ProductRepository;
import com.storyline.erp.inventory.repository.RawMaterialRepository;
import com.storyline.erp.inventory.repository.StockTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ManufacturingService {

    private final ProductRepository productRepository;
    private final BillOfMaterialRepository bomRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public ManufacturingService(ProductRepository productRepository, BillOfMaterialRepository bomRepository,
                                RawMaterialRepository rawMaterialRepository, StockTransactionRepository stockTransactionRepository) {
        this.productRepository = productRepository;
        this.bomRepository = bomRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    public void processManufactureBatch(ManufactureRequestDto request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<BillOfMaterial> boms = bomRepository.findByProductId(product.getId());
        if (boms.isEmpty()) {
            throw new IllegalStateException("Product has no Bill of Materials defined. Cannot manufacture.");
        }

        // 1. Verify we have enough raw materials
        for (BillOfMaterial bom : boms) {
            java.math.BigDecimal required = bom.getQuantity().multiply(java.math.BigDecimal.valueOf(request.quantityToManufacture()));
            if (bom.getRawMaterial().getCurrentStock().compareTo(required) < 0) {
                throw new IllegalStateException("Insufficient stock for raw material: " + bom.getRawMaterial().getSku() + 
                        " (Required: " + required + ", Available: " + bom.getRawMaterial().getCurrentStock() + ")");
            }
        }

        // 2. Deduct raw materials and record transactions
        for (BillOfMaterial bom : boms) {
            java.math.BigDecimal required = bom.getQuantity().multiply(java.math.BigDecimal.valueOf(request.quantityToManufacture()));
            RawMaterial rm = bom.getRawMaterial();
            rm.setCurrentStock(rm.getCurrentStock().subtract(required));
            rawMaterialRepository.save(rm);

            StockTransaction tx = new StockTransaction();
            tx.setRawMaterial(rm);
            tx.setQuantity(required.negate());
            tx.setTransactionType("MANUFACTURE_CONSUMPTION");
            tx.setReference("PRODUCT_" + product.getId() + "_QTY_" + request.quantityToManufacture());
            tx.setNotes("Consumed for manufacturing Product: " + product.getSku());
            stockTransactionRepository.save(tx);
        }

        // 3. Add finished goods (Product) to inventory
        product.setCurrentStock(product.getCurrentStock().add(java.math.BigDecimal.valueOf(request.quantityToManufacture())));
        productRepository.save(product);
    }
}
