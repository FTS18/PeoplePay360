package com.peoplepay360.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class RlsSessionContextInterceptor implements HandlerInterceptor {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof SecurityUser securityUser) {
            try {
                String userIdStr = securityUser.getId().toString();
                String roleStr = securityUser.getRole().name();

                jdbcTemplate.execute(String.format("SET LOCAL app.current_user_id = '%s';", userIdStr));
                jdbcTemplate.execute(String.format("SET LOCAL app.current_user_role = '%s';", roleStr));
            } catch (Exception e) {
                log.debug("Failed to set PostgreSQL RLS session variables: {}", e.getMessage());
            }
        }

        return true;
    }
}
