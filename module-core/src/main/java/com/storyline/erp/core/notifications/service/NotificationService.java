package com.storyline.erp.core.notifications.service;

import com.storyline.erp.core.notifications.entity.Notification;
import com.storyline.erp.core.notifications.repository.NotificationRepository;
import com.storyline.erp.core.notifications.entity.DeviceToken;
import com.storyline.erp.core.notifications.repository.DeviceTokenRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;

    @Transactional
    public Notification createNotification(Long userId, String title, String message, String type) {
        Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setTitle(title);
        notif.setMessage(message);
        notif.setType(type);
        notif.setRead(false);
        Notification saved = notificationRepository.save(notif);

        // Send FCM Push Notification
        try {
            List<DeviceToken> tokens = deviceTokenRepository.findByUserId(userId);
            for (DeviceToken token : tokens) {
                Message fcmMessage = Message.builder()
                        .setToken(token.getToken())
                        .putData("title", title)
                        .putData("body", message)
                        .putData("type", type != null ? type : "info")
                        .build();
                FirebaseMessaging.getInstance().send(fcmMessage);
                log.info("Sent FCM notification to user {}", userId);
            }
        } catch (Exception e) {
            log.error("Failed to send FCM push notification: {}", e.getMessage());
        }

        return saved;
    }

    public List<Notification> getMyUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long id, Long userId) {
        Notification notif = notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!notif.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        notif.setRead(true);
        notificationRepository.save(notif);
    }
    
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseAndIsDeletedFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
