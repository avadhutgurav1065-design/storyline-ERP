package com.storyline.erp.events.dto;

import com.storyline.erp.events.entity.Event;
import com.storyline.erp.events.entity.Task;
import com.storyline.erp.events.entity.VendorAssignment;
import java.util.List;

public record EventDashboardDto(
        Event event,
        List<Task> tasks,
        List<VendorAssignment> vendorAssignments,
        Integer progress
) {}
