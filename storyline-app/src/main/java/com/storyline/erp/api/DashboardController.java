package com.storyline.erp.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.crm.entity.LeadStatus;
import com.storyline.erp.crm.repository.ClientRepository;
import com.storyline.erp.crm.repository.LeadRepository;
import com.storyline.erp.events.repository.EventRepository;
import com.storyline.erp.events.repository.TaskRepository;
import com.storyline.erp.events.entity.EventStatus;
import com.storyline.erp.finance.repository.InvoiceRepository;
import com.storyline.erp.finance.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("isAuthenticated()") // Service-level RBAC filters data based on role
public class DashboardController {

    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final EventRepository eventRepository;
    private final InvoiceRepository invoiceRepository;
    private final TaskRepository taskRepository;
    private final ExpenseRepository expenseRepository;

    public DashboardController(LeadRepository leadRepository, ClientRepository clientRepository,
                               EventRepository eventRepository, InvoiceRepository invoiceRepository,
                               TaskRepository taskRepository, ExpenseRepository expenseRepository) {
        this.leadRepository = leadRepository;
        this.clientRepository = clientRepository;
        this.eventRepository = eventRepository;
        this.invoiceRepository = invoiceRepository;
        this.taskRepository = taskRepository;
        this.expenseRepository = expenseRepository;
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean hasManagerAccess = false;
        boolean hasFinanceAccess = false;
        if (auth != null) {
            hasManagerAccess = auth.getAuthorities().stream()
                    .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_EVENT_MANAGER") || a.equals("SCOPE_ALL"));
            hasFinanceAccess = auth.getAuthorities().stream()
                    .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_FINANCE_MANAGER") || a.equals("SCOPE_ALL"));
        }

        // --- CHART DATA (Available to all, but filtered) ---
        Map<String, Long> taskCharts = new HashMap<>();
        if (hasManagerAccess) {
            taskCharts.put("PENDING", taskRepository.countByStatus("PENDING"));
            taskCharts.put("IN_PROGRESS", taskRepository.countByStatus("IN_PROGRESS"));
            taskCharts.put("COMPLETED", taskRepository.countByStatus("COMPLETED"));
            long overdueTasks = taskRepository.findAll().stream()
                    .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(java.time.LocalDate.now()) && !("COMPLETED".equals(t.getStatus())))
                    .count();
            taskCharts.put("OVERDUE", overdueTasks);
        } else {
            // Ground staff only see their own tasks
            try {
                Long currentUserId = Long.parseLong(auth.getName());
                var myTasks = taskRepository.findByAssignedUserId(currentUserId);
                taskCharts.put("PENDING", myTasks.stream().filter(t -> "PENDING".equals(t.getStatus())).count());
                taskCharts.put("IN_PROGRESS", myTasks.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count());
                taskCharts.put("COMPLETED", myTasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count());
                taskCharts.put("OVERDUE", myTasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(java.time.LocalDate.now()) && !("COMPLETED".equals(t.getStatus()))).count());
            } catch (Exception e) {
                // Ignore
            }
        }
        stats.put("taskCharts", taskCharts);
        
        // Return early if not a manager
        if (!hasManagerAccess && !hasFinanceAccess) {
             return ApiResponse.success(stats);
        }

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.YearMonth currentMonth = java.time.YearMonth.from(now);
        java.time.YearMonth previousMonth = currentMonth.minusMonths(1);

        if (hasManagerAccess) {
            stats.put("totalLeads", leadRepository.count());
            stats.put("totalClients", clientRepository.count());
            stats.put("totalEvents", eventRepository.count());
            
            var allLeads = leadRepository.findAll();
            var allClients = clientRepository.findAll();
            long currentMonthLeads = allLeads.stream().filter(l -> l.getCreatedAt() != null && java.time.YearMonth.from(l.getCreatedAt()).equals(currentMonth)).count();
            long previousMonthLeads = allLeads.stream().filter(l -> l.getCreatedAt() != null && java.time.YearMonth.from(l.getCreatedAt()).equals(previousMonth)).count();
            long currentMonthClients = allClients.stream().filter(c -> c.getCreatedAt() != null && java.time.YearMonth.from(c.getCreatedAt()).equals(currentMonth)).count();
            long previousMonthClients = allClients.stream().filter(c -> c.getCreatedAt() != null && java.time.YearMonth.from(c.getCreatedAt()).equals(previousMonth)).count();
            
            stats.put("leadsGrowth", calculateGrowth(BigDecimal.valueOf(currentMonthLeads), BigDecimal.valueOf(previousMonthLeads)));
            stats.put("clientsGrowth", calculateGrowth(BigDecimal.valueOf(currentMonthClients), BigDecimal.valueOf(previousMonthClients)));

            Map<String, Long> eventCharts = new HashMap<>();
            eventCharts.put("PLANNING", eventRepository.countByStatus(EventStatus.PLANNING));
            eventCharts.put("IN_PROGRESS", eventRepository.countByStatus(EventStatus.IN_PROGRESS));
            eventCharts.put("COMPLETED", eventRepository.countByStatus(EventStatus.COMPLETED));
            stats.put("eventCharts", eventCharts);
        }

        if (hasFinanceAccess) {
            var allInvoices = invoiceRepository.findAll();
            var allExpenses = expenseRepository.findAll();

            BigDecimal currentMonthRevenue = allInvoices.stream()
                    .filter(i -> "PAID".equals(i.getStatus().name()) && i.getIssueDate() != null && java.time.YearMonth.from(i.getIssueDate()).equals(currentMonth))
                    .map(i -> i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal previousMonthRevenue = allInvoices.stream()
                    .filter(i -> "PAID".equals(i.getStatus().name()) && i.getIssueDate() != null && java.time.YearMonth.from(i.getIssueDate()).equals(previousMonth))
                    .map(i -> i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            stats.put("monthlyRevenue", currentMonthRevenue);
            stats.put("revenueGrowth", calculateGrowth(currentMonthRevenue, previousMonthRevenue));

            java.util.List<Map<String, Object>> trendData = new java.util.ArrayList<>();
            for (int i = 5; i >= 0; i--) {
                java.time.YearMonth ym = currentMonth.minusMonths(i);
                BigDecimal rev = allInvoices.stream()
                    .filter(inv -> "PAID".equals(inv.getStatus().name()) && inv.getIssueDate() != null && java.time.YearMonth.from(inv.getIssueDate()).equals(ym))
                    .map(inv -> inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal exp = allExpenses.stream()
                    .filter(e -> e.getExpenseDate() != null && java.time.YearMonth.from(e.getExpenseDate()).equals(ym))
                    .map(e -> e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("name", ym.getMonth().name().substring(0, 3));
                monthData.put("Revenue", rev);
                monthData.put("Expenses", exp);
                trendData.add(monthData);
            }
            stats.put("revenueTrend", trendData);
        }

        return ApiResponse.success(stats);
    }
    
    private double calculateGrowth(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        BigDecimal diff = current.subtract(previous);
        return diff.divide(previous, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
    }
}
