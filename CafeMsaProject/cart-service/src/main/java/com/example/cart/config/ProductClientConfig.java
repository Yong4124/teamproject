package com.example.cart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

// src/main/java/com/example/cart/config/ProductClientConfig.java
@Configuration
public class ProductClientConfig {
    @Bean
    public WebClient productWebClient(@Value("${catalog.base-url:http://localhost:8000}") String baseUrl) {
        return WebClient.builder().baseUrl(baseUrl).build();
    }
}