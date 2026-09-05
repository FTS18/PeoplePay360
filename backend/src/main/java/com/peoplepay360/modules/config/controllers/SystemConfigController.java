package com.peoplepay360.modules.config.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.modules.config.dto.BulkUpdateConfigRequest;
import com.peoplepay360.modules.config.dto.SystemConfigResponse;
import com.peoplepay360.modules.config.entities.SystemConfig;
import com.peoplepay360.modules.config.services.SystemConfigService;
import com.peoplepay360.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService configService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, List<SystemConfigResponse>>>> getAllConfigs(
            @RequestParam(required = false) String category
    ) {
        List<SystemConfig> configs;
        if (category != null && !category.isBlank()) {
            configs = configService.getConfigsByCategory(category);
        } else {
            configs = configService.getAllConfigs();
        }

        Map<String, List<SystemConfigResponse>> grouped = configs.stream()
                .map(SystemConfigResponse::from)
                .collect(Collectors.groupingBy(SystemConfigResponse::getCategory));

        return ResponseEntity.ok(ApiResponse.ok("System configurations fetched successfully", grouped));
    }

    @GetMapping("/{key}")
    public ResponseEntity<ApiResponse<SystemConfigResponse>> getConfigByKey(@PathVariable String key) {
        SystemConfig config = configService.getConfigByKey(key)
                .orElseThrow(() -> new com.peoplepay360.exception.ResourceNotFoundException("SystemConfig", "configKey", key));
        return ResponseEntity.ok(ApiResponse.ok(SystemConfigResponse.from(config)));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, List<SystemConfigResponse>>>> bulkUpdateConfigs(
            @Valid @RequestBody BulkUpdateConfigRequest request,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        String updatedBy = currentUser != null ? currentUser.getUsername() : "system";
        List<SystemConfig> updated = configService.bulkUpdate(request.getConfigs(), updatedBy);

        Map<String, List<SystemConfigResponse>> grouped = updated.stream()
                .map(SystemConfigResponse::from)
                .collect(Collectors.groupingBy(SystemConfigResponse::getCategory));

        return ResponseEntity.ok(ApiResponse.ok("System configurations updated successfully", grouped));
    }
}
