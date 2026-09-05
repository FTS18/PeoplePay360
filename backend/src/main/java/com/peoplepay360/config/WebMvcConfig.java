package com.peoplepay360.config;

import com.peoplepay360.security.RlsSessionContextInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final RlsSessionContextInterceptor rlsSessionContextInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rlsSessionContextInterceptor)
                .addPathPatterns("/api/**", "/employees/**", "/contracts/**", "/attendance/**", "/timeoff/**", "/payroll/**", "/dashboard/**");
    }
}
