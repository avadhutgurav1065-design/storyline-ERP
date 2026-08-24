package com.storyline.erp.sales.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.sales.dto.QuotationDto;
import com.storyline.erp.sales.dto.QuotationItemDto;
import com.storyline.erp.sales.entity.Quotation;
import com.storyline.erp.sales.entity.QuotationItem;
import com.storyline.erp.sales.entity.QuotationStatus;
import com.storyline.erp.sales.repository.QuotationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuotationService {

    private final QuotationRepository quotationRepository;

    public QuotationService(QuotationRepository quotationRepository) {
        this.quotationRepository = quotationRepository;
    }

    public Page<QuotationDto> getAllQuotations(Pageable pageable) {
        return quotationRepository.findAll(pageable)
                .map(this::mapToDto);
    }

    public Page<QuotationDto> getClientQuotations(Long clientId, Pageable pageable) {
        return quotationRepository.findByClientId(clientId, pageable)
                .map(this::mapToDto);
    }

    public QuotationDto getQuotation(Long id) {
        return mapToDto(findById(id));
    }

    public QuotationDto createQuotation(QuotationDto dto) {
        Quotation quotation = new Quotation();
        quotation.setQuoteNumber(generateQuoteNumber());
        updateEntityFromDto(quotation, dto);
        calculateTotals(quotation);
        return mapToDto(quotationRepository.save(quotation));
    }

    public QuotationDto updateQuotation(Long id, QuotationDto dto) {
        Quotation quotation = findById(id);
        
        // Cannot update if approved or sent (unless admin override, handled at controller)
        if (quotation.getStatus() == QuotationStatus.APPROVED) {
            throw new IllegalStateException("Cannot edit an approved quotation. Create a new version.");
        }

        quotation.getItems().clear(); // Let orphan removal handle deletions
        updateEntityFromDto(quotation, dto);
        calculateTotals(quotation);
        return mapToDto(quotationRepository.save(quotation));
    }

    public QuotationDto createNewVersion(Long parentId) {
        Quotation parent = findById(parentId);
        
        Quotation newVersion = new Quotation();
        newVersion.setQuoteNumber(parent.getQuoteNumber());
        newVersion.setVersion(parent.getVersion() + 1);
        newVersion.setParentQuotationId(parent.getId());
        newVersion.setClientId(parent.getClientId());
        newVersion.setEventName(parent.getEventName());
        newVersion.setEventDate(parent.getEventDate());
        newVersion.setPax(parent.getPax());
        newVersion.setVenue(parent.getVenue());
        newVersion.setStatus(QuotationStatus.DRAFT);
        newVersion.setDiscountAmount(parent.getDiscountAmount());
        newVersion.setNotes(parent.getNotes());

        parent.getItems().forEach(item -> {
            QuotationItem newItem = new QuotationItem();
            newItem.setGroupName(item.getGroupName());
            newItem.setDescription(item.getDescription());
            newItem.setQuantity(item.getQuantity());
            newItem.setUnitPrice(item.getUnitPrice());
            newItem.setTaxPercent(item.getTaxPercent());
            newItem.setTotal(item.getTotal());
            newVersion.addItem(newItem);
        });

        calculateTotals(newVersion);
        return mapToDto(quotationRepository.save(newVersion));
    }

    public QuotationDto updateStatus(Long id, QuotationStatus status) {
        Quotation quotation = findById(id);
        quotation.setStatus(status);
        return mapToDto(quotationRepository.save(quotation));
    }

    private Quotation findById(Long id) {
        return quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found: " + id));
    }

    private String generateQuoteNumber() {
        return "QT-" + System.currentTimeMillis(); // Simplified sequence
    }

    private void calculateTotals(Quotation quotation) {
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;

        for (QuotationItem item : quotation.getItems()) {
            BigDecimal lineTotal = item.getQuantity().multiply(item.getUnitPrice());
            BigDecimal lineTax = lineTotal.multiply(item.getTaxPercent() != null ? item.getTaxPercent() : BigDecimal.ZERO)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            
            item.setTotal(lineTotal.add(lineTax));
            total = total.add(lineTotal);
            tax = tax.add(lineTax);
        }

        quotation.setTotalAmount(total);
        quotation.setTaxAmount(tax);
        
        BigDecimal discount = quotation.getDiscountAmount() != null ? quotation.getDiscountAmount() : BigDecimal.ZERO;
        quotation.setGrandTotal(total.add(tax).subtract(discount));
    }

    private QuotationDto mapToDto(Quotation quotation) {
        List<QuotationItemDto> items = quotation.getItems().stream()
                .map(i -> new QuotationItemDto(i.getId(), i.getGroupName(), i.getDescription(), 
                        i.getQuantity(), i.getUnitPrice(), i.getTaxPercent(), i.getTotal()))
                .collect(Collectors.toList());

        return new QuotationDto(
                quotation.getId(), quotation.getQuoteNumber(), quotation.getClientId(),
                quotation.getEventName(), quotation.getEventDate(), quotation.getPax(),
                quotation.getVenue(), quotation.getVersion(), quotation.getParentQuotationId(),
                quotation.getStatus(), quotation.getTotalAmount(), quotation.getTaxAmount(),
                quotation.getDiscountAmount(), quotation.getGrandTotal(), quotation.getNotes(), items);
    }

    private void updateEntityFromDto(Quotation quotation, QuotationDto dto) {
        quotation.setClientId(dto.clientId());
        quotation.setEventName(dto.eventName());
        quotation.setEventDate(dto.eventDate());
        quotation.setPax(dto.pax());
        quotation.setVenue(dto.venue());
        if (dto.discountAmount() != null) quotation.setDiscountAmount(dto.discountAmount());
        quotation.setNotes(dto.notes());

        if (dto.items() != null) {
            dto.items().forEach(itemDto -> {
                QuotationItem item = new QuotationItem();
                item.setGroupName(itemDto.groupName());
                item.setDescription(itemDto.description());
                item.setQuantity(itemDto.quantity());
                item.setUnitPrice(itemDto.unitPrice());
                item.setTaxPercent(itemDto.taxPercent());
                quotation.addItem(item);
            });
        }
    }
}
