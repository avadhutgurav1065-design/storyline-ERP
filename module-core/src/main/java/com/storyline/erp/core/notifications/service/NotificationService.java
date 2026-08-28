package com.storyline.erp.core.notifications.service;

import com.storyline.erp.core.notifications.entity.Notification;
import com.storyline.erp.core.notifications.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(Long userId, String title, String message, String type) {
        Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setTitle(title);
        notif.setMessage(message);
        notif.setType(type);
        notif.setRead(false);
        return notificationRepository.save(notif);
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
