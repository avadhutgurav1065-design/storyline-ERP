package com.storyline.erp.identity.internal.service;

import com.storyline.erp.common.dto.PageResponse;
import com.storyline.erp.common.exception.BusinessException;
import com.storyline.erp.common.exception.ResourceNotFoundException;
import com.storyline.erp.identity.internal.dto.AuthDtos.*;
import com.storyline.erp.identity.internal.entity.Permission;
import com.storyline.erp.identity.internal.entity.Role;
import com.storyline.erp.identity.internal.entity.User;
import com.storyline.erp.identity.internal.repository.RoleRepository;
import com.storyline.erp.identity.internal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for user CRUD operations.
 */
@Service
@Transactional
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a new user.
     */
    public UserResponse createUser(CreateUserRequest request) {
        // Validate uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email '" + request.getEmail() + "' is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .active(true)
                .roles(new HashSet<>())
                .build();

        // Assign roles
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
                user.addRole(role);
            }
        }

        User savedUser = userRepository.save(user);
        log.info("Created user: {} with roles: {}", savedUser.getEmail(), request.getRoles());

        return mapToUserResponse(savedUser);
    }

    /**
     * Get a user by ID.
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserResponse(user);
    }

    /**
     * List users with search and pagination.
     */
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> listUsers(String search, Boolean active, int page, int size) {
        String safeSearch = (search == null) ? "" : search;
        Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());
        Page<User> userPage = userRepository.findAllWithFilters(safeSearch, active, pageable);

        List<UserResponse> users = userPage.getContent().stream()
                .map(this::mapToUserResponse)
                .toList();

        return PageResponse.of(users, page, size, userPage.getTotalElements(), userPage.getTotalPages());
    }

    /**
     * Update a user.
     */
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        // Update roles if provided
        if (request.getRoles() != null) {
            Set<Role> newRoles = new HashSet<>();
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
                newRoles.add(role);
            }
            user.setRoles(newRoles);
        }

        User savedUser = userRepository.save(user);
        log.info("Updated user: {}", savedUser.getEmail());

        return mapToUserResponse(savedUser);
    }

    /**
     * Activate or deactivate a user.
     */
    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setActive(!user.isActive());
        User savedUser = userRepository.save(user);
        log.info("User {} status changed to: {}", savedUser.getEmail(), savedUser.isActive() ? "active" : "inactive");

        return mapToUserResponse(savedUser);
    }

    private UserResponse mapToUserResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        Set<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::toPermissionString)
                .collect(Collectors.toSet());

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .active(user.isActive())
                .roles(roles)
                .permissions(permissions)
                .build();
    }
}
