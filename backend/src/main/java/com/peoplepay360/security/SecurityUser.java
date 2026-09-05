package com.peoplepay360.security;

import com.peoplepay360.common.enums.Role;
import com.peoplepay360.modules.employee.entities.Employee;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
public class SecurityUser implements UserDetails {

    private final UUID id;
    private final String email;
    private final String password;
    private final Role role;
    private final Collection<? extends GrantedAuthority> authorities;

    public SecurityUser(Employee employee) {
        this.id = employee.getId();
        this.email = employee.getEmail();
        this.password = employee.getPassword();
        this.role = employee.getRole();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + employee.getRole().name()));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
