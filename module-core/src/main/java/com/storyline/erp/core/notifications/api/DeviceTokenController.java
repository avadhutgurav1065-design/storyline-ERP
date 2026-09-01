package com.storyline.erp.core.notifications.api;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.core.notifications.entity.DeviceToken;
import com.storyline.erp.core.notifications.repository.DeviceTokenRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/notifications/tokens")
@RequiredArgsConstructor
public class DeviceTokenController {

    private final DeviceTokenRepository deviceTokenRepository;

    @PostMapping
    public ApiResponse<Void> registerToken(@RequestBody TokenRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("Unauthorized");
        }

        Long userId = Long.valueOf(auth.getName());
        
        Optional<DeviceToken> existing = deviceTokenRepository.findByToken(request.getToken());
        if (existing.isPresent()) {
            DeviceToken token = existing.get();
            token.setUserId(userId);
            deviceTokenRepository.save(token);
        } else {
            DeviceToken newToken = new DeviceToken();
            newToken.setToken(request.getToken());
            newToken.setUserId(userId);
            deviceTokenRepository.save(newToken);
        }
        return ApiResponse.success((Void) null, "Token registered successfully");
    }

    @Data
    public static class TokenRequest {
        private String token;
    }
}
