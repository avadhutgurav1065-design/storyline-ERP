package com.storyline.erp.inventory.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.inventory.dto.RawMaterialDto;
import com.storyline.erp.inventory.entity.RawMaterial;
import com.storyline.erp.inventory.repository.RawMaterialRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;

    public RawMaterialService(RawMaterialRepository rawMaterialRepository) {
        this.rawMaterialRepository = rawMaterialRepository;
    }

    public Page<RawMaterialDto> searchRawMaterials(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return rawMaterialRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(search, search, pageable)
                    .map(this::mapToDto);
        }
        return rawMaterialRepository.findAll(pageable).map(this::mapToDto);
    }

    public RawMaterialDto getRawMaterial(Long id) {
        return mapToDto(findById(id));
    }

    public RawMaterialDto createRawMaterial(RawMaterialDto dto) {
        if (rawMaterialRepository.findBySku(dto.sku()).isPresent()) {
            throw new IllegalArgumentException("SKU already exists: " + dto.sku());
        }
        RawMaterial rm = new RawMaterial();
        updateEntityFromDto(rm, dto);
        if (dto.currentStock() != null) rm.setCurrentStock(dto.currentStock());
        else rm.setCurrentStock(0.0);
        
        return mapToDto(rawMaterialRepository.save(rm));
    }

    public RawMaterialDto updateRawMaterial(Long id, RawMaterialDto dto) {
        RawMaterial rm = findById(id);
        
        if (!rm.getSku().equals(dto.sku()) && rawMaterialRepository.findBySku(dto.sku()).isPresent()) {
            throw new IllegalArgumentException("SKU already exists: " + dto.sku());
        }

        updateEntityFromDto(rm, dto);
        // Note: currentStock should ideally be updated via StockTransactions, 
        // but allowing direct update for manual reconciliation for now.
        if (dto.currentStock() != null) {
            rm.setCurrentStock(dto.currentStock());
        }

        return mapToDto(rawMaterialRepository.save(rm));
    }

    public void deleteRawMaterial(Long id) {
        RawMaterial rm = findById(id);
        rawMaterialRepository.delete(rm);
    }

    private RawMaterial findById(Long id) {
        return rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw material not found: " + id));
    }

    private RawMaterialDto mapToDto(RawMaterial rm) {
        return new RawMaterialDto(
                rm.getId(), rm.getSku(), rm.getName(), 
                rm.getUnitOfMeasure(), rm.getCurrentStock(), rm.getMinimumStock()
        );
    }

    private void updateEntityFromDto(RawMaterial rm, RawMaterialDto dto) {
        rm.setSku(dto.sku());
        rm.setName(dto.name());
        rm.setUnitOfMeasure(dto.unitOfMeasure());
        if (dto.minimumStock() != null) rm.setMinimumStock(dto.minimumStock());
    }
}
