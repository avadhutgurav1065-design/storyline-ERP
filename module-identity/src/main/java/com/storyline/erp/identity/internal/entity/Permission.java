package com.storyline.erp.identity.internal.entity;

import com.storyline.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Permission entity representing a specific action on a module.
 * Examples: CRM:CREATE, SALES:READ, EVENTS:UPDATE, FINANCE:DELETE
 */
@Entity
@Table(name = "permissions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"module", "action", "scope"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission extends BaseEntity {

    /**
     * Module this permission belongs to.
     * e.g., CRM, SALES, EVENTS, TEAMS, VENDORS, TASKS, HAMPERS, INVENTORY, FINANCE, REPORTS
     */
    @Column(nullable = false, length = 30)
    private String module;

    /**
     * Action allowed.
     * e.g., CREATE, READ, UPDATE, DELETE, EXPORT, APPROVE
     */
    @Column(nullable = false, length = 20)
    private String action;

    /**
     * Scope of access.
     * ALL — can access everything in the module
     * OWN — can access only own records
     * ASSIGNED — can access only assigned records (events, teams, etc.)
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String scope = "ALL";

    @Column(length = 200)
    private String description;

    /**
     * Returns permission string in format: MODULE:ACTION:SCOPE
     */
    public String toPermissionString() {
        return String.format("%s:%s:%s", module, action, scope);
    }
}
