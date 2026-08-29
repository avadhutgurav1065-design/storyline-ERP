package com.storyline.erp.events.service;

import com.storyline.erp.common.event.QuotationApprovedEvent;
import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.entity.EventStatus;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class SalesEventListener {

    private final EventService eventService;

    public SalesEventListener(EventService eventService) {
        this.eventService = eventService;
    }

    @EventListener
    public void handleQuotationApproved(QuotationApprovedEvent eventData) {
        // Automatically scaffold an Event in PLANNING status
        Event newEvent = new Event();
        newEvent.setName(eventData.eventName() != null ? eventData.eventName() : "Event for Quote " + eventData.quotationId());
        newEvent.setStartDate(eventData.eventDate());
        newEvent.setEndDate(eventData.eventDate()); // Default to same day
        newEvent.setVenue(eventData.venue());
        newEvent.setPax(eventData.pax());
        newEvent.setClientId(eventData.clientId());
        newEvent.setQuotationId(eventData.quotationId());
        newEvent.setStatus(EventStatus.PLANNING); // User requested editable planning state
        newEvent.setProgress(0);
        newEvent.setNotes("Automatically generated from Approved Quotation #" + eventData.quotationId());
        
        eventService.createEvent(newEvent);
    }
}
