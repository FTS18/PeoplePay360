package com.peoplepay360.modules.employee.dto.requests;

import com.peoplepay360.common.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateAccessRequest {

    @NotNull(message = "Role is required")
    private Role role;

    // When false, employee account is deactivated (INACTIVE status)
    private boolean active = true;
}
