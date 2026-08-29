package com.storyline.erp.identity.internal.repository;

import com.storyline.erp.identity.internal.entity.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
    List<UserActivityLog> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
