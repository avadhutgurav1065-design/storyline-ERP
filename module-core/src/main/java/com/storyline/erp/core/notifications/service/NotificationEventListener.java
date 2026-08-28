package com.storyline.erp.core.notifications.service;

import com.storyline.erp.common.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        notificationService.createNotification(
                event.getUserId(),
                event.getTitle(),
                event.getMessage(),
                event.getType()
        );
    }
}
