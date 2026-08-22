package com.storyline.erp.crm.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.crm.dto.ClientDto;
import com.storyline.erp.crm.dto.FollowUpDto;
import com.storyline.erp.crm.dto.LeadDto;
import com.storyline.erp.crm.entity.LeadStatus;
import com.storyline.erp.crm.service.CrmService;
import com.storyline.erp.crm.service.FollowUpService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm")
public class CrmController {

    private final CrmService crmService;
    private final FollowUpService followUpService;

    public CrmController(CrmService crmService, FollowUpService followUpService) {
        this.crmService = crmService;
        this.followUpService = followUpService;
    }

    // ==========================================
    // Leads
    // ==========================================

    @GetMapping("/leads")
    @PreAuthorize("hasAnyAuthority('SCOPE_ALL', 'SCOPE_ASSIGNED')")
    public ApiResponse<PageResponse<LeadDto>> searchLeads(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) Long assignedTo,
            Pageable pageable) {
        Page<LeadDto> leads = crmService.searchLeads(search, status, assignedTo, pageable);
        return ApiResponse.success(PageResponse.of(leads));
    }

    @GetMapping("/leads/{id}")
    public ApiResponse<LeadDto> getLead(@PathVariable Long id) {
        return ApiResponse.success(crmService.getLead(id));
    }

    @PostMapping("/leads")
    @PreAuthorize("hasAuthority('ACTION_CREATE')")
    public ApiResponse<LeadDto> createLead(@Valid @RequestBody LeadDto dto) {
        return ApiResponse.success("Lead created successfully", crmService.createLead(dto));
    }

    @PutMapping("/leads/{id}")
    @PreAuthorize("hasAuthority('ACTION_UPDATE')")
    public ApiResponse<LeadDto> updateLead(@PathVariable Long id, @Valid @RequestBody LeadDto dto) {
        return ApiResponse.success("Lead updated successfully", crmService.updateLead(id, dto));
    }

    @DeleteMapping("/leads/{id}")
    @PreAuthorize("hasAuthority('ACTION_DELETE')")
    public ApiResponse<Void> deleteLead(@PathVariable Long id) {
        crmService.deleteLead(id);
        return ApiResponse.success("Lead deleted successfully", null);
    }

    @PostMapping("/leads/{id}/convert")
    @PreAuthorize("hasAuthority('ACTION_UPDATE')")
    public ApiResponse<ClientDto> convertLeadToClient(@PathVariable Long id, @RequestBody ClientDto dto) {
        return ApiResponse.success("Lead converted to client successfully", crmService.convertLeadToClient(id, dto));
    }

    // ==========================================
    // Clients
    // ==========================================

    @GetMapping("/clients")
    @PreAuthorize("hasAuthority('SCOPE_ALL')")
    public ApiResponse<PageResponse<ClientDto>> searchClients(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<ClientDto> clients = crmService.searchClients(search, pageable);
        return ApiResponse.success(PageResponse.of(clients));
    }

    @GetMapping("/clients/{id}")
    public ApiResponse<ClientDto> getClient(@PathVariable Long id) {
        return ApiResponse.success(crmService.getClient(id));
    }

    @PostMapping("/clients")
    @PreAuthorize("hasAuthority('ACTION_CREATE')")
    public ApiResponse<ClientDto> createClient(@Valid @RequestBody ClientDto dto) {
        return ApiResponse.success("Client created successfully", crmService.createClient(dto));
    }

    @PutMapping("/clients/{id}")
    @PreAuthorize("hasAuthority('ACTION_UPDATE')")
    public ApiResponse<ClientDto> updateClient(@PathVariable Long id, @Valid @RequestBody ClientDto dto) {
        return ApiResponse.success("Client updated successfully", crmService.updateClient(id, dto));
    }

    @DeleteMapping("/clients/{id}")
    @PreAuthorize("hasAuthority('ACTION_DELETE')")
    public ApiResponse<Void> deleteClient(@PathVariable Long id) {
        crmService.deleteClient(id);
        return ApiResponse.success("Client deleted successfully", null);
    }

    // ==========================================
    // Follow-ups
    // ==========================================

    @GetMapping("/leads/{leadId}/follow-ups")
    public ApiResponse<List<FollowUpDto>> getLeadFollowUps(@PathVariable Long leadId) {
        return ApiResponse.success(followUpService.getLeadFollowUps(leadId));
    }

    @GetMapping("/clients/{clientId}/follow-ups")
    public ApiResponse<List<FollowUpDto>> getClientFollowUps(@PathVariable Long clientId) {
        return ApiResponse.success(followUpService.getClientFollowUps(clientId));
    }

    @PostMapping("/follow-ups")
    public ApiResponse<FollowUpDto> createFollowUp(@Valid @RequestBody FollowUpDto dto) {
        return ApiResponse.success("Follow-up created", followUpService.createFollowUp(dto));
    }
}
