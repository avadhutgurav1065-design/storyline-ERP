package com.storyline.erp.inventory.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.inventory.dto.DispatchRequestDto;
import com.storyline.erp.inventory.dto.DispatchLogDto;
import com.storyline.erp.inventory.entity.Product;
import com.storyline.erp.inventory.entity.StockTransaction;
import com.storyline.erp.inventory.entity.DispatchLog;
import com.storyline.erp.inventory.repository.ProductRepository;
import com.storyline.erp.inventory.repository.StockTransactionRepository;
import com.storyline.erp.inventory.repository.DispatchLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DispatchService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final DispatchLogRepository dispatchLogRepository;

    public DispatchService(ProductRepository productRepository, StockTransactionRepository stockTransactionRepository, DispatchLogRepository dispatchLogRepository) {
        this.productRepository = productRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.dispatchLogRepository = dispatchLogRepository;
    }

    public void dispatchToEvent(DispatchRequestDto request) {
        for (DispatchRequestDto.DispatchItemDto item : request.items()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.productId()));

            // User requested strict blocking on stock shortages
            if (product.getCurrentStock().compareTo(item.quantity()) < 0) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() + ". Available: " + product.getCurrentStock() + ", Requested: " + item.quantity());
            }

            // Deduct stock
            product.setCurrentStock(product.getCurrentStock().subtract(item.quantity()));
            productRepository.save(product);

            // Record Dispatch Log
            DispatchLog log = new DispatchLog();
            log.setEventId(request.eventId());
            log.setProduct(product);
            log.setQuantity(item.quantity());
            log.setNotes(request.notes());
            dispatchLogRepository.save(log);
        }
    }

    public List<DispatchLogDto> getDispatchLogsByEventId(Long eventId) {
        return dispatchLogRepository.findByEventId(eventId).stream()
                .map(log -> new DispatchLogDto(
                        log.getId(),
                        log.getEventId(),
                        log.getProduct().getId(),
                        log.getProduct().getName(),
                        log.getQuantity(),
                        log.getNotes(),
                        log.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
