package com.storyline.erp.inventory.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.inventory.entity.Product;
import com.storyline.erp.inventory.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ApiResponse<PageResponse<Product>> listProducts(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        return ApiResponse.success(PageResponse.of(products));
    }

    @PostMapping
    public ApiResponse<Product> createProduct(@RequestBody Product product) {
        return ApiResponse.success("Product created", productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @RequestBody Product updated) {
        Product existing = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        existing.setSku(updated.getSku());
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setBasePrice(updated.getBasePrice());
        existing.setActive(updated.isActive());
        return ApiResponse.success("Product updated", productRepository.save(existing));
    }
}
