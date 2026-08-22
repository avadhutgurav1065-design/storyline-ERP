package com.storyline.erp.finance.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.finance.entity.Invoice;
import com.storyline.erp.finance.repository.InvoiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finance/invoices")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;

    public InvoiceController(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping
    public ApiResponse<PageResponse<Invoice>> listInvoices(Pageable pageable) {
        Page<Invoice> invoices = invoiceRepository.findAll(pageable);
        return ApiResponse.success(PageResponse.of(invoices));
    }

    @PostMapping
    public ApiResponse<Invoice> createInvoice(@RequestBody Invoice invoice) {
        return ApiResponse.success("Invoice created", invoiceRepository.save(invoice));
    }
}
