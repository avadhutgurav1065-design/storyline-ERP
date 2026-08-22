package com.storyline.erp.events.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    
    private final EventRepository eventRepository;
    
    public EventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }
    
    @GetMapping
    public ApiResponse<PageResponse<Event>> listEvents(Pageable pageable) {
        Page<Event> events = eventRepository.findAll(pageable);
        return ApiResponse.success(PageResponse.of(events));
    }
    
    @PostMapping
    public ApiResponse<Event> createEvent(@RequestBody Event event) {
        return ApiResponse.success("Event created", eventRepository.save(event));
    }
}
