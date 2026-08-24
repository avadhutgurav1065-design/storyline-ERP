package com.storyline.erp.events.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.dto.EventDashboardDto;
import com.storyline.erp.events.service.EventService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    
    private final EventService eventService;
    
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }
    
    @GetMapping
    public ApiResponse<PageResponse<Event>> listEvents(Pageable pageable) {
        return ApiResponse.success(PageResponse.of(eventService.listEvents(pageable)));
    }
    
    @PostMapping
    public ApiResponse<Event> createEvent(@RequestBody Event event) {
        return ApiResponse.success("Event created", eventService.createEvent(event));
    }

    @PutMapping("/{id}")
    public ApiResponse<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return ApiResponse.success("Event updated", eventService.updateEvent(id, event));
    }

    @GetMapping("/{id}/dashboard")
    public ApiResponse<EventDashboardDto> getEventDashboard(@PathVariable Long id) {
        return ApiResponse.success(eventService.getEventDashboard(id));
    }
}
