package com.storyline.erp.events.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.events.entity.Vendor;
import com.storyline.erp.events.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
    }

    public Vendor createVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(Long id, Vendor vendorDetails) {
        Vendor vendor = getVendorById(id);
        vendor.setName(vendorDetails.getName());
        vendor.setServiceType(vendorDetails.getServiceType());
        vendor.setPhone(vendorDetails.getPhone());
        vendor.setEmail(vendorDetails.getEmail());
        vendor.setGstNumber(vendorDetails.getGstNumber());
        vendor.setAddress(vendorDetails.getAddress());
        vendor.setActive(vendorDetails.isActive());
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(Long id) {
        vendorRepository.delete(getVendorById(id));
    }
}
