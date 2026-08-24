package com.storyline.erp.events.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.events.entity.VendorAssignment;
import com.storyline.erp.events.repository.VendorAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class VendorAssignmentService {

    private final VendorAssignmentRepository vendorAssignmentRepository;

    public VendorAssignmentService(VendorAssignmentRepository vendorAssignmentRepository) {
        this.vendorAssignmentRepository = vendorAssignmentRepository;
    }

    public List<VendorAssignment> getAssignmentsByEventId(Long eventId) {
        return vendorAssignmentRepository.findByEventId(eventId);
    }

    public VendorAssignment assignVendor(VendorAssignment assignment) {
        return vendorAssignmentRepository.save(assignment);
    }

    public VendorAssignment updateAssignment(Long id, VendorAssignment assignmentDetails) {
        VendorAssignment assignment = vendorAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor assignment not found"));
        assignment.setTask(assignmentDetails.getTask());
        assignment.setAgreedAmount(assignmentDetails.getAgreedAmount());
        assignment.setStatus(assignmentDetails.getStatus());
        return vendorAssignmentRepository.save(assignment);
    }

    public void removeAssignment(Long id) {
        vendorAssignmentRepository.deleteById(id);
    }
}
