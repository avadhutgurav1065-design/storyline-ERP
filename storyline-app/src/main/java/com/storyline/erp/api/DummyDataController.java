package com.storyline.erp.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.crm.entity.Client;
import com.storyline.erp.crm.entity.Lead;
import com.storyline.erp.crm.entity.LeadStatus;
import com.storyline.erp.crm.repository.ClientRepository;
import com.storyline.erp.crm.repository.LeadRepository;

import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.entity.EventStatus;
import com.storyline.erp.events.entity.Task;
import com.storyline.erp.events.entity.TeamAssignment;
import com.storyline.erp.events.entity.EventDocument;
import com.storyline.erp.events.repository.EventRepository;
import com.storyline.erp.events.repository.TaskRepository;
import com.storyline.erp.events.repository.TeamAssignmentRepository;
import com.storyline.erp.events.repository.EventDocumentRepository;

import com.storyline.erp.finance.entity.Expense;
import com.storyline.erp.finance.entity.Invoice;
import com.storyline.erp.finance.entity.InvoiceStatus;
import com.storyline.erp.finance.entity.Payment;
import com.storyline.erp.finance.repository.ExpenseRepository;
import com.storyline.erp.finance.repository.InvoiceRepository;
import com.storyline.erp.finance.repository.PaymentRepository;

import com.storyline.erp.inventory.entity.Product;
import com.storyline.erp.inventory.entity.RawMaterial;
import com.storyline.erp.inventory.repository.ProductRepository;
import com.storyline.erp.inventory.repository.RawMaterialRepository;

import com.storyline.erp.sales.entity.Quotation;
import com.storyline.erp.sales.entity.QuotationStatus;
import com.storyline.erp.sales.repository.QuotationRepository;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/dev")
public class DummyDataController {

    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final EventRepository eventRepository;
    private final TaskRepository taskRepository;
    private final TeamAssignmentRepository teamAssignmentRepository;
    private final EventDocumentRepository eventDocumentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductRepository productRepository;
    private final QuotationRepository quotationRepository;
    private final PaymentRepository paymentRepository;

    public DummyDataController(
            LeadRepository leadRepository, ClientRepository clientRepository,
            EventRepository eventRepository, TaskRepository taskRepository,
            TeamAssignmentRepository teamAssignmentRepository,
            EventDocumentRepository eventDocumentRepository,
            InvoiceRepository invoiceRepository, ExpenseRepository expenseRepository,
            RawMaterialRepository rawMaterialRepository, ProductRepository productRepository,
            QuotationRepository quotationRepository, PaymentRepository paymentRepository) {
        this.leadRepository = leadRepository;
        this.clientRepository = clientRepository;
        this.eventRepository = eventRepository;
        this.taskRepository = taskRepository;
        this.teamAssignmentRepository = teamAssignmentRepository;
        this.eventDocumentRepository = eventDocumentRepository;
        this.invoiceRepository = invoiceRepository;
        this.expenseRepository = expenseRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.productRepository = productRepository;
        this.quotationRepository = quotationRepository;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/seed")
    @Transactional
    public ApiResponse<String> seedData() {
        
        // 1. Seed CRM (Leads)
        String[] leadNames = {"Rahul Sharma", "Priya Desai", "Amit Patel", "Sneha Kapoor", "Vikas Singh", "Neha Gupta", "Rohan Mehta", "Pooja Joshi", "Karan Malhotra", "Anjali Verma"};
        LeadStatus[] statuses = {LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.NEW};
        for (int i = 0; i < 10; i++) {
            Lead lead = new Lead();
            lead.setName(leadNames[i]);
            lead.setPhone("987654321" + i);
            lead.setEmail("lead" + i + "@example.com");
            lead.setCompany(i % 2 == 0 ? "TechCorp India" : "Innovate Solutions");
            lead.setEventType(i % 3 == 0 ? "Corporate Event" : "Wedding");
            lead.setEventDate(LocalDate.now().plusDays(15 + (i * 10)));
            lead.setBudget(new BigDecimal(50000 + (i * 20000)));
            lead.setStatus(statuses[i % statuses.length]);
            lead.setSource("Website");
            leadRepository.save(lead);
        }

        // 2. Seed CRM (Clients)
        String[] clientNames = {"Tata Motors", "Infosys Events", "Reliance Retail", "Wipro Galas", "HDFC Bank Annuals"};
        for (int i = 0; i < 5; i++) {
            Client client = new Client();
            client.setName(clientNames[i]);
            client.setEmail("contact@" + clientNames[i].toLowerCase().replace(" ", "") + ".com");
            client.setPhone("998877665" + i);
            client.setAddress("Mumbai, Maharashtra");
            client.setCompany(clientNames[i]);
            client.setGstNumber("27AADCB2230M1Z" + i);
            clientRepository.save(client);
        }

        // 3. Seed Quotations
        for (int i = 1; i <= 5; i++) {
            Quotation q = new Quotation();
            q.setQuoteNumber("QT-" + System.currentTimeMillis() + "-" + i);
            q.setClientId((long) i);
            q.setEventName("Demo Event " + i);
            q.setTotalAmount(new BigDecimal(120000 + (i * 10000)));
            q.setStatus(QuotationStatus.DRAFT);
            quotationRepository.save(q);
        }

        // 4. Seed Events (New events)
        String[] eventNames = {"Annual Tech Summit 2026", "Desai Wedding Extravaganza", "Product Launch: Alpha", "End of Year Gala"};
        EventStatus[] evtStatuses = {EventStatus.IN_PROGRESS, EventStatus.PLANNING, EventStatus.IN_PROGRESS, EventStatus.COMPLETED};
        int[] progressVals = {45, 10, 75, 100};
        
        for (int i = 0; i < 4; i++) {
            Event event = new Event();
            event.setName(eventNames[i]);
            event.setStartDate(LocalDate.now().plusDays(i * 5));
            event.setEndDate(LocalDate.now().plusDays((i * 5) + 2));
            event.setVenue("Grand Hyatt, Mumbai");
            event.setPax(500 + (i * 100));
            event.setStatus(evtStatuses[i]);
            event.setProgress(progressVals[i]);
            event.setEventHeadId(1L);
            eventRepository.save(event);
        }

        // 5. Seed Tasks, Teams, and Documents for ALL Events (including user's existing events)
        List<Event> allEvents = eventRepository.findAll();
        for (Event event : allEvents) {
            // Team Assignments
            TeamAssignment ta = new TeamAssignment();
            ta.setEvent(event);
            ta.setUserId(2L);
            ta.setRole("Logistics Manager");
            ta.setDepartment("LOGISTICS");
            ta.setIsHead(true);
            teamAssignmentRepository.save(ta);
            
            TeamAssignment ta2 = new TeamAssignment();
            ta2.setEvent(event);
            ta2.setUserId(3L);
            ta2.setRole("Event Coordinator");
            ta2.setDepartment("OPERATIONS");
            ta2.setIsHead(false);
            teamAssignmentRepository.save(ta2);

            // Checklist Tasks
            List<String> taskTitles = Arrays.asList("Book Venue", "Finalize Catering Menu", "Send Invitations", "Hire AV Equipment", "Confirm Decorator", "Book Transport", "Sign Contracts");
            for (int t = 0; t < 7; t++) {
                Task task = new Task();
                task.setEvent(event);
                task.setTitle(taskTitles.get(t));
                task.setDescription("Ensure " + taskTitles.get(t).toLowerCase() + " is completed on time.");
                task.setPriority("HIGH");
                task.setStatus(t % 2 == 0 ? "COMPLETED" : "PENDING");
                taskRepository.save(task);
            }

            // Event Documents
            EventDocument doc1 = new EventDocument();
            doc1.setEvent(event);
            doc1.setName("Venue Contract");
            doc1.setDocumentType("Contract");
            doc1.setFileUrl("https://example.com/docs/venue_contract.pdf");
            eventDocumentRepository.save(doc1);

            EventDocument doc2 = new EventDocument();
            doc2.setEvent(event);
            doc2.setName("Initial Guest List");
            doc2.setDocumentType("List");
            doc2.setFileUrl("https://example.com/docs/guest_list.xlsx");
            eventDocumentRepository.save(doc2);
        }

        // 6. Seed Finance (Invoices & Expenses & Payments)
        for (int i = 1; i <= 5; i++) {
            Invoice inv = new Invoice();
            inv.setInvoiceNumber("INV-" + System.currentTimeMillis() + "-" + String.format("%03d", i));
            inv.setClientId((long) i);
            inv.setIssueDate(LocalDate.now().minusDays(i * 3));
            inv.setDueDate(LocalDate.now().plusDays(15));
            inv.setTotalAmount(new BigDecimal(150000 + (i * 25000)));
            inv.setStatus(InvoiceStatus.PAID);
            Invoice savedInv = invoiceRepository.save(inv);
            
            Payment pay = new Payment();
            pay.setInvoiceId(savedInv.getId());
            pay.setClientId((long) i);
            pay.setAmount(new BigDecimal(150000 + (i * 25000)));
            pay.setPaymentDate(LocalDate.now());
            pay.setPaymentMethod("BANK_TRANSFER");
            pay.setPaymentReference("REF-" + System.currentTimeMillis() + "-" + i);
            paymentRepository.save(pay);

            Expense exp = new Expense();
            exp.setCategory(i % 2 == 0 ? "Operations" : "Marketing");
            exp.setAmount(new BigDecimal(20000 + (i * 5000)));
            exp.setExpenseDate(LocalDate.now().minusDays(i));
            exp.setDescription("Payment for generic service " + i);
            expenseRepository.save(exp);
        }

        // 7. Seed Inventory
        String[] materials = {"Premium Satin Drapes", "Wooden Stage Panels", "LED Par Cans", "Floral Centerpieces", "Red Carpet Roll"};
        for (int i = 0; i < 5; i++) {
            RawMaterial rm = new RawMaterial();
            rm.setName(materials[i]);
            rm.setSku("RM-" + (1000 + i));
            rm.setCurrentStock(50.0 + (i * 10));
            rm.setUnitOfMeasure("Pieces");
            rm.setMinimumStock(10.0);
            rawMaterialRepository.save(rm);
        }
        
        String[] hampers = {"VIP Welcome Hamper", "Corporate Gift Box", "Wedding Return Gift"};
        for (int i = 0; i < 3; i++) {
            Product p = new Product();
            p.setName(hampers[i]);
            p.setSku("HMP-" + (200 + i));
            p.setBasePrice(new BigDecimal(2500 + (i * 500)));
            p.setCurrentStock(20.0 + i * 5);
            productRepository.save(p);
        }

        return ApiResponse.success("Dummy data successfully seeded across ALL features and applied to ALL existing events! (Vendors skipped)");
    }
}
