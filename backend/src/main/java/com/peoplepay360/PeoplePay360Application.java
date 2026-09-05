package com.peoplepay360;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PeoplePay360Application {

    public static void main(String[] args) {
        SpringApplication.run(PeoplePay360Application.class, args);
    }
}
