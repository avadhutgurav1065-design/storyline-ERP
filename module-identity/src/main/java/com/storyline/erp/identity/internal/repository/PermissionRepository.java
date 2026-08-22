package com.storyline.erp.identity.internal.repository;

import com.storyline.erp.identity.internal.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    List<Permission> findByModule(String module);

    Optional<Permission> findByModuleAndActionAndScope(String module, String action, String scope);
}
