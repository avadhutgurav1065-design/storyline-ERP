package com.storyline.erp.inventory.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.inventory.dto.DispatchRequestDto;
import com.storyline.erp.inventory.entity.Product;
import com.storyline.erp.inventory.entity.StockTransaction;
import com.storyline.erp.inventory.repository.ProductRepository;
import com.storyline.erp.inventory.repository.StockTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DispatchService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public DispatchService(ProductRepository productRepository, StockTransactionRepository stockTransactionRepository) {
        this.productRepository = productRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    public void dispatchToEvent(DispatchRequestDto request) {
        for (DispatchRequestDto.DispatchItemDto item : request.items()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.productId()));

            // User requested strict blocking on stock shortages
            if (product.getCurrentStock() < item.quantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() + ". Available: " + product.getCurrentStock() + ", Requested: " + item.quantity());
            }

            // Deduct stock
            product.setCurrentStock(product.getCurrentStock() - item.quantity());
            productRepository.save(product);

            // Record transaction
            StockTransaction tx = new StockTransaction();
            tx.setProductId(product.getId());
            tx.setTransactionType("OUT");
            tx.setQuantity(item.quantity());
            tx.setReference("EVENT-" + request.eventId());
            tx.setNotes("Dispatched to Event ID " + request.eventId() + ". Notes: " + request.notes());
            stockTransactionRepository.save(tx);
        }
    }
}
