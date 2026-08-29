package com.storyline.erp.identity.internal.service;

import com.storyline.erp.identity.internal.entity.User;
import com.storyline.erp.identity.internal.entity.UserActivityLog;
import com.storyline.erp.identity.internal.repository.UserActivityLogRepository;
import com.storyline.erp.identity.internal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserActivityService {

    private final UserActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public UserActivityService(UserActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    public void logActivity(Long userId, String action, String details) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            UserActivityLog log = UserActivityLog.builder()
                    .user(user)
                    .action(action)
                    .details(details)
                    .build();
            activityLogRepository.save(log);
        }
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDto> getRecentActivities(Long userId) {
        return activityLogRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(log -> new ActivityLogDto(
                        log.getId(),
                        log.getAction(),
                        log.getDetails(),
                        log.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public record ActivityLogDto(Long id, String action, String details, java.time.LocalDateTime createdAt) {}
}
