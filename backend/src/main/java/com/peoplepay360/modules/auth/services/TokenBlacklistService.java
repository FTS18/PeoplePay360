package com.peoplepay360.modules.auth.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String BLACKLIST_KEY_PREFIX = "blacklist:token:";

    public void blacklistToken(String token, long expirationMs) {
        if (token == null || token.isBlank()) return;
        String key = BLACKLIST_KEY_PREFIX + token;
        long ttl = expirationMs > 0 ? expirationMs : 86400000L; // default 24h
        try {
            redisTemplate.opsForValue().set(key, "blacklisted", ttl, TimeUnit.MILLISECONDS);
            log.info("JWT token blacklisted in Redis for {} ms: {}", ttl, token.substring(0, Math.min(10, token.length())) + "...");
        } catch (Exception e) {
            log.warn("Redis unavailable for token blacklisting, falling back gracefully: {}", e.getMessage());
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) return false;
        String key = BLACKLIST_KEY_PREFIX + token;
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.warn("Redis unavailable for token blacklist check, allowing fallback: {}", e.getMessage());
            return false;
        }
    }
}
