package com.storyline.erp.common.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NotificationEvent extends ApplicationEvent {

    private final Long userId;
    private final String title;
    private final String message;
    private final String type;

    public NotificationEvent(Object source, Long userId, String title, String message, String type) {
        super(source);
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
    }
}
