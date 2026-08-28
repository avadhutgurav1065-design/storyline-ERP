package com.storyline.erp.core.notifications.api;

import com.storyline.erp.core.dto.ApiResponse;
import com.storyline.erp.core.notifications.entity.Notification;
import com.storyline.erp.core.notifications.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(Principal principal) {
        Long userId = Long.parseLong(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(notificationService.getMyNotifications(userId)));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnread(Principal principal) {
        Long userId = Long.parseLong(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(notificationService.getMyUnreadNotifications(userId)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id, Principal principal) {
        Long userId = Long.parseLong(principal.getName());
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Principal principal) {
        Long userId = Long.parseLong(principal.getName());
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
