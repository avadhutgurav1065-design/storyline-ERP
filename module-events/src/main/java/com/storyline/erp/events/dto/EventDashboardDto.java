package com.storyline.erp.events.dto;

import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.entity.Task;
import com.storyline.erp.events.entity.VendorAssignment;
import com.storyline.erp.events.entity.TeamAssignment;
import com.storyline.erp.events.entity.EventDocument;
import java.util.List;

public record EventDashboardDto(
        Event event,
        List<Task> tasks,
        List<VendorAssignment> vendorAssignments,
        List<TeamAssignment> teamAssignments,
        List<EventDocument> documents,
        Integer progress
) {}
