package com.storyline.erp.identity.internal.controller;

import com.storyline.erp.common.dto.ApiResponse;
import com.storyline.erp.identity.internal.dto.AuthDtos.*;
import com.storyline.erp.identity.internal.service.AuthService;
import com.storyline.erp.identity.internal.service.UserActivityService;
import com.storyline.erp.identity.internal.service.UserActivityService.ActivityLogDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Authentication REST controller.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserActivityService userActivityService;

    public AuthController(AuthService authService, UserActivityService userActivityService) {
        this.authService = authService;
        this.userActivityService = userActivityService;
    }

    /**
     * Login with email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    /**
     * Refresh access token using refresh token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed"));
    }

    /**
     * Get the current authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        UserResponse user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * Update the current authenticated user's profile.
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        UserResponse user = authService.updateProfile(userId, request);
        userActivityService.logActivity(userId, "Updated Profile", "User updated their profile information");
        return ResponseEntity.ok(ApiResponse.success(user, "Profile updated successfully"));
    }

    /**
     * Change password.
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        authService.changePassword(userId, request);
        userActivityService.logActivity(userId, "Changed Password", "User updated their password successfully");
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", (Void) null));
    }

    /**
     * Get recent activities of the authenticated user.
     */
    @GetMapping("/me/activities")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getRecentActivities(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<ActivityLogDto> activities = userActivityService.getRecentActivities(userId);
        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}
