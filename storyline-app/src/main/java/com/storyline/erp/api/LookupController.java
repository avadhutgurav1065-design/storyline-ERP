package com.storyline.erp.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.identity.internal.repository.UserRepository;
import com.storyline.erp.events.repository.EventRepository;
import com.storyline.erp.events.repository.VendorRepository;
import com.storyline.erp.crm.repository.ClientRepository;
import com.storyline.erp.inventory.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lookups")
@PreAuthorize("isAuthenticated()") // Accessible to all logged-in users
public class LookupController {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final VendorRepository vendorRepository;
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;

    public LookupController(UserRepository userRepository, 
                            EventRepository eventRepository,
                            VendorRepository vendorRepository,
                            ClientRepository clientRepository,
                            ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.vendorRepository = vendorRepository;
        this.clientRepository = clientRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> lookupUsers() {
        List<Map<String, Object>> result = userRepository.findAll().stream()
                .map(u -> Map.of(
                        "id", (Object) u.getId(),
                        "fullName", (Object) (u.getFullName() != null ? u.getFullName() : (u.getUsername() != null ? u.getUsername() : u.getEmail()))
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> lookupEvents() {
        List<Map<String, Object>> result = eventRepository.findAll().stream()
                .map(e -> Map.of(
                        "id", (Object) e.getId(),
                        "title", (Object) (e.getName() != null ? e.getName() : "Event " + e.getId())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/vendors")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> lookupVendors() {
        List<Map<String, Object>> result = vendorRepository.findAll().stream()
                .map(v -> Map.of(
                        "id", (Object) v.getId(),
                        "name", (Object) (v.getName() != null ? v.getName() : "Vendor " + v.getId())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/clients")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> lookupClients() {
        List<Map<String, Object>> result = clientRepository.findAll().stream()
                .map(c -> Map.of(
                        "id", (Object) c.getId(),
                        "name", (Object) (c.getName() != null ? c.getName() : "Client " + c.getId())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> lookupProducts() {
        List<Map<String, Object>> result = productRepository.findAll().stream()
                .map(p -> Map.of(
                        "id", (Object) p.getId(),
                        "name", (Object) (p.getName() != null ? p.getName() : "Product " + p.getId())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
