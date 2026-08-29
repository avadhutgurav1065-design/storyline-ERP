package com.storyline.erp.identity.internal.entity;

import com.storyline.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * User entity representing all system users.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "theme_preference")
    @Builder.Default
    private String themePreference = "system";

    @Column(name = "email_notifications")
    @Builder.Default
    private boolean emailNotifications = true;

    @Column(name = "push_notifications")
    @Builder.Default
    private boolean pushNotifications = true;

    @Column
    private String address;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    /**
     * Add a role to this user.
     */
    public void addRole(Role role) {
        this.roles.add(role);
    }

    /**
     * Remove a role from this user.
     */
    public void removeRole(Role role) {
        this.roles.remove(role);
    }

    /**
     * Check if user has a specific role by name.
     */
    public boolean hasRole(String roleName) {
        return roles.stream().anyMatch(r -> r.getName().equalsIgnoreCase(roleName));
    }
}
