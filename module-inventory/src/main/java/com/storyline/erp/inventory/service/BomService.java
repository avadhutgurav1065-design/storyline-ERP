package com.storyline.erp.inventory.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.inventory.dto.BillOfMaterialDto;
import com.storyline.erp.inventory.entity.BillOfMaterial;
import com.storyline.erp.inventory.entity.Product;
import com.storyline.erp.inventory.entity.RawMaterial;
import com.storyline.erp.inventory.repository.BillOfMaterialRepository;
import com.storyline.erp.inventory.repository.ProductRepository;
import com.storyline.erp.inventory.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BomService {

    private final BillOfMaterialRepository bomRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public BomService(BillOfMaterialRepository bomRepository, ProductRepository productRepository, RawMaterialRepository rawMaterialRepository) {
        this.bomRepository = bomRepository;
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
    }

    public List<BillOfMaterialDto> getProductBom(Long productId) {
        return bomRepository.findByProductId(productId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BillOfMaterialDto> updateProductBom(Long productId, List<BillOfMaterialDto> bomItems) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        bomRepository.deleteByProductId(productId);
        // Flush to ensure deletes are processed before inserts (if unique constraints exist)
        bomRepository.flush();

        List<BillOfMaterial> newBoms = bomItems.stream().map(dto -> {
            RawMaterial rm = rawMaterialRepository.findById(dto.rawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Raw material not found: " + dto.rawMaterialId()));
            
            BillOfMaterial bom = new BillOfMaterial();
            bom.setProduct(product);
            bom.setRawMaterial(rm);
            bom.setQuantity(dto.quantity());
            return bom;
        }).collect(Collectors.toList());

        List<BillOfMaterial> saved = bomRepository.saveAll(newBoms);
        return saved.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private BillOfMaterialDto mapToDto(BillOfMaterial bom) {
        return new BillOfMaterialDto(
                bom.getId(),
                bom.getProduct().getId(),
                bom.getRawMaterial().getId(),
                bom.getRawMaterial().getName(),
                bom.getRawMaterial().getSku(),
                bom.getRawMaterial().getUnitOfMeasure(),
                bom.getQuantity()
        );
    }
}
