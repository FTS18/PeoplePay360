package com.peoplepay360.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.username:${MAIL_USERNAME:}}")
    private String username;

    @Value("${spring.mail.password:${MAIL_PASSWORD:}}")
    private String password;

    @Value("${app.mail.secondary.username:${SECONDARY_MAIL_USERNAME:}}")
    private String secondaryUsername;

    @Value("${app.mail.secondary.password:${SECONDARY_MAIL_PASSWORD:}}")
    private String secondaryPassword;

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        return createSender(username, password);
    }

    @Bean(name = "secondaryMailSender")
    public JavaMailSender secondaryMailSender() {
        return createSender(secondaryUsername, secondaryPassword);
    }

    private JavaMailSenderImpl createSender(String user, String pass) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(user);
        mailSender.setPassword(pass);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "false");

        return mailSender;
    }
}
