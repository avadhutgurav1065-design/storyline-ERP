package com.storyline.erp.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.crm.entity.LeadStatus;
import com.storyline.erp.crm.repository.ClientRepository;
import com.storyline.erp.crm.repository.LeadRepository;
import com.storyline.erp.events.repository.EventRepository;
import com.storyline.erp.finance.repository.InvoiceRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final EventRepository eventRepository;
    private final InvoiceRepository invoiceRepository;

    public DashboardController(LeadRepository leadRepository, ClientRepository clientRepository,
                               EventRepository eventRepository, InvoiceRepository invoiceRepository) {
        this.leadRepository = leadRepository;
        this.clientRepository = clientRepository;
        this.eventRepository = eventRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Basic aggregations for the dashboard
        stats.put("totalLeads", leadRepository.count());
        stats.put("newLeads", leadRepository.countByStatus(LeadStatus.NEW));
        stats.put("totalClients", clientRepository.count());
        stats.put("totalEvents", eventRepository.count());
        stats.put("totalInvoices", invoiceRepository.count());
        
        // Mock revenue for now (could be an aggregate query on invoices table)
        stats.put("monthlyRevenue", 1500000); 

        return ApiResponse.success(stats);
    }
}
