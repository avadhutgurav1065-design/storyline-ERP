package com.storyline.erp.crm.service;

import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.crm.dto.ClientDto;
import com.storyline.erp.crm.dto.LeadDto;
import com.storyline.erp.crm.entity.Client;
import com.storyline.erp.crm.entity.Lead;
import com.storyline.erp.crm.entity.LeadStatus;
import com.storyline.erp.crm.repository.ClientRepository;
import com.storyline.erp.crm.repository.LeadRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CrmService {

    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;

    public CrmService(LeadRepository leadRepository, ClientRepository clientRepository) {
        this.leadRepository = leadRepository;
        this.clientRepository = clientRepository;
    }

    // ==========================================
    // Leads
    // ==========================================

    public Page<LeadDto> searchLeads(String search, LeadStatus status, Long assignedTo, Pageable pageable) {
        String searchTerm = search != null && !search.isBlank() ? search : "";
        return leadRepository.searchLeads(searchTerm, status, assignedTo, pageable)
                .map(this::mapToDto);
    }

    public LeadDto getLead(Long id) {
        return mapToDto(findLeadById(id));
    }

    public LeadDto createLead(LeadDto dto) {
        Lead lead = new Lead();
        updateLeadFromDto(lead, dto);
        return mapToDto(leadRepository.save(lead));
    }

    public LeadDto updateLead(Long id, LeadDto dto) {
        Lead lead = findLeadById(id);
        updateLeadFromDto(lead, dto);
        return mapToDto(leadRepository.save(lead));
    }

    public void deleteLead(Long id) {
        leadRepository.deleteById(id);
    }

    public ClientDto convertLeadToClient(Long leadId, ClientDto clientDto) {
        Lead lead = findLeadById(leadId);
        lead.setStatus(LeadStatus.CONVERTED);
        leadRepository.save(lead);

        Client client = new Client();
        client.setName(clientDto.name() != null ? clientDto.name() : lead.getName());
        client.setEmail(clientDto.email() != null ? clientDto.email() : lead.getEmail());
        client.setPhone(clientDto.phone() != null ? clientDto.phone() : lead.getPhone());
        client.setCompany(clientDto.company() != null ? clientDto.company() : lead.getCompany());
        client.setAddress(clientDto.address());
        client.setGstNumber(clientDto.gstNumber());
        client.setConvertedFromLeadId(lead.getId());
        
        return mapToDto(clientRepository.save(client));
    }

    // ==========================================
    // Clients
    // ==========================================

    public Page<ClientDto> searchClients(String search, Pageable pageable) {
        String searchTerm = search != null && !search.isBlank() ? search : "";
        return clientRepository.searchClients(searchTerm, pageable)
                .map(this::mapToDto);
    }

    public ClientDto getClient(Long id) {
        return mapToDto(findClientById(id));
    }

    public ClientDto createClient(ClientDto dto) {
        Client client = new Client();
        updateClientFromDto(client, dto);
        return mapToDto(clientRepository.save(client));
    }

    public ClientDto updateClient(Long id, ClientDto dto) {
        Client client = findClientById(id);
        updateClientFromDto(client, dto);
        return mapToDto(clientRepository.save(client));
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }

    // ==========================================
    // Helpers
    // ==========================================

    private Lead findLeadById(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
    }

    private Client findClientById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
    }

    private LeadDto mapToDto(Lead lead) {
        return new LeadDto(lead.getId(), lead.getName(), lead.getEmail(), lead.getPhone(),
                lead.getCompany(), lead.getEventType(), lead.getEventDate(), lead.getBudget(),
                lead.getStatus(), lead.getSource(), lead.getAssignedToUserId());
    }

    private void updateLeadFromDto(Lead lead, LeadDto dto) {
        lead.setName(dto.name());
        lead.setEmail(dto.email());
        lead.setPhone(dto.phone());
        lead.setCompany(dto.company());
        lead.setEventType(dto.eventType());
        lead.setEventDate(dto.eventDate());
        lead.setBudget(dto.budget());
        if (dto.status() != null) lead.setStatus(dto.status());
        lead.setSource(dto.source());
        lead.setAssignedToUserId(dto.assignedToUserId());
    }

    private ClientDto mapToDto(Client client) {
        return new ClientDto(client.getId(), client.getName(), client.getEmail(), client.getPhone(),
                client.getCompany(), client.getAddress(), client.getGstNumber(), client.getConvertedFromLeadId());
    }

    private void updateClientFromDto(Client client, ClientDto dto) {
        client.setName(dto.name());
        client.setEmail(dto.email());
        client.setPhone(dto.phone());
        client.setCompany(dto.company());
        client.setAddress(dto.address());
        client.setGstNumber(dto.gstNumber());
    }
}
