package com.storyline.erp.inventory.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.inventory.entity.BillOfMaterial;
import com.storyline.erp.inventory.entity.Product;
import com.storyline.erp.inventory.entity.RawMaterial;
import com.storyline.erp.inventory.entity.StockTransaction;
import com.storyline.erp.inventory.repository.BillOfMaterialRepository;
import com.storyline.erp.inventory.repository.ProductRepository;
import com.storyline.erp.inventory.repository.RawMaterialRepository;
import com.storyline.erp.inventory.repository.StockTransactionRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class InventoryService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final BillOfMaterialRepository bomRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final ApplicationEventPublisher eventPublisher;

    public InventoryService(ProductRepository productRepository, 
                            RawMaterialRepository rawMaterialRepository,
                            BillOfMaterialRepository bomRepository, 
                            StockTransactionRepository stockTransactionRepository,
                            ApplicationEventPublisher eventPublisher) {
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.bomRepository = bomRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.eventPublisher = eventPublisher;
    }

    // --- Products ---
    public List<Product> listProducts() { return productRepository.findAll(); }
    public Product getProduct(Long id) { return productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found")); }
    public Product createProduct(Product p) { return productRepository.save(p); }
    public Product updateProduct(Long id, Product updated) {
        Product p = getProduct(id);
        p.setSku(updated.getSku());
        p.setName(updated.getName());
        p.setDescription(updated.getDescription());
        p.setBasePrice(updated.getBasePrice());
        p.setIsActive(updated.getIsActive());
        return productRepository.save(p);
    }

    // --- Raw Materials ---
    public List<RawMaterial> listRawMaterials() { return rawMaterialRepository.findAll(); }
    public RawMaterial getRawMaterial(Long id) { return rawMaterialRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Raw material not found")); }
    public RawMaterial createRawMaterial(RawMaterial rm) { return rawMaterialRepository.save(rm); }
    public RawMaterial updateRawMaterial(Long id, RawMaterial updated) {
        RawMaterial rm = getRawMaterial(id);
        rm.setSku(updated.getSku());
        rm.setName(updated.getName());
        rm.setUnitOfMeasure(updated.getUnitOfMeasure());
        rm.setMinimumStock(updated.getMinimumStock());
        return rawMaterialRepository.save(rm);
    }

    // --- Bill of Materials ---
    public List<BillOfMaterial> getBomForProduct(Long productId) { return bomRepository.findByProductId(productId); }
    public BillOfMaterial addBomItem(Long productId, Long rmId, BigDecimal quantity) {
        Product p = getProduct(productId);
        RawMaterial rm = getRawMaterial(rmId);
        BillOfMaterial bom = new BillOfMaterial();
        bom.setProduct(p);
        bom.setRawMaterial(rm);
        bom.setQuantity(quantity);
        return bomRepository.save(bom);
    }
    public void removeBomItem(Long bomId) { bomRepository.deleteById(bomId); }

    // --- Stock Transactions ---
    public void addStock(Long rawMaterialId, BigDecimal quantity, String reference, String notes) {
        RawMaterial rm = getRawMaterial(rawMaterialId);
        rm.setCurrentStock(rm.getCurrentStock().add(quantity));
        rawMaterialRepository.save(rm);

        StockTransaction tx = new StockTransaction();
        tx.setRawMaterial(rm);
        tx.setTransactionType("IN");
        tx.setQuantity(quantity);
        tx.setReference(reference);
        tx.setNotes(notes);
        stockTransactionRepository.save(tx);
    }

    public void removeStock(Long rawMaterialId, BigDecimal quantity, String reference, String notes) {
        RawMaterial rm = getRawMaterial(rawMaterialId);
        if (rm.getCurrentStock().compareTo(quantity) < 0) {
            throw new IllegalStateException("Insufficient stock for " + rm.getName());
        }
        rm.setCurrentStock(rm.getCurrentStock().subtract(quantity));
        rawMaterialRepository.save(rm);

        StockTransaction tx = new StockTransaction();
        tx.setRawMaterial(rm);
        tx.setTransactionType("OUT");
        tx.setQuantity(quantity);
        tx.setReference(reference);
        tx.setNotes(notes);
        stockTransactionRepository.save(tx);
    }

    public void produceHamper(Long productId, Integer quantity, String reference) {
        Product p = getProduct(productId);
        List<BillOfMaterial> bomList = getBomForProduct(productId);
        
        if (bomList.isEmpty()) {
            throw new IllegalStateException("Product has no Bill of Materials defined.");
        }

        BigDecimal qtyMultiplier = new BigDecimal(quantity);

        // First check if all materials are in stock
        for (BillOfMaterial bomItem : bomList) {
            BigDecimal requiredQty = bomItem.getQuantity().multiply(qtyMultiplier);
            if (bomItem.getRawMaterial().getCurrentStock().compareTo(requiredQty) < 0) {
                throw new IllegalStateException("Insufficient stock for raw material: " + bomItem.getRawMaterial().getName() + ". Required: " + requiredQty + ", Available: " + bomItem.getRawMaterial().getCurrentStock());
            }
        }

        // Deduct materials
        for (BillOfMaterial bomItem : bomList) {
            BigDecimal requiredQty = bomItem.getQuantity().multiply(qtyMultiplier);
            removeStock(bomItem.getRawMaterial().getId(), requiredQty, reference, "Produced " + quantity + " units of " + p.getName());
        }
        
        // Increase Product Stock
        if (p.getCurrentStock() == null) {
            p.setCurrentStock(BigDecimal.ZERO);
        }
        p.setCurrentStock(p.getCurrentStock().add(qtyMultiplier));
        productRepository.save(p);
    }

    public void issueHamperToEvent(Long productId, Integer quantity, Long eventId, String reference) {
        Product p = getProduct(productId);
        
        BigDecimal qtyMultiplier = new BigDecimal(quantity);
        if (p.getCurrentStock() == null || p.getCurrentStock().compareTo(qtyMultiplier) < 0) {
            throw new IllegalStateException("Insufficient stock for product: " + p.getName());
        }

        // Deduct Product Stock
        p.setCurrentStock(p.getCurrentStock().subtract(qtyMultiplier));
        productRepository.save(p);

        // Calculate Cost from BOM
        List<BillOfMaterial> bomList = getBomForProduct(productId);
        BigDecimal totalCost = BigDecimal.ZERO;
        for (BillOfMaterial bomItem : bomList) {
            BigDecimal materialCost = bomItem.getRawMaterial().getUnitCost();
            if (materialCost == null) materialCost = BigDecimal.ZERO;
            
            BigDecimal costForOne = bomItem.getQuantity().multiply(materialCost);
            totalCost = totalCost.add(costForOne.multiply(qtyMultiplier));
        }

        // Publish Event so Finance Module can create an Expense
        eventPublisher.publishEvent(new com.storyline.erp.common.event.HamperIssuedEvent(this, eventId, p.getName(), quantity, totalCost));
    }
}
