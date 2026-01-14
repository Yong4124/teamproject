package com.example.cart.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.NoSuchElementException;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "catalog.stub", havingValue = "false", matchIfMissing = true)
public class HttpProductLookup implements ProductLookup {

    private final WebClient productWebClient;

    private record ProductDto(Long id, String name, Long price, Boolean available) {}

    @Override
    public ProductSnapshot getSnapshot(Long productId) {
        ProductDto p = productWebClient.get()
                .uri("/api/products/{id}", productId) // 상품 서비스 엔드포인트에 맞추세요
                .retrieve()
                .bodyToMono(ProductDto.class)
                .block();

        if (p == null || Boolean.FALSE.equals(p.available())) {
            throw new NoSuchElementException("구매 불가/없음: " + productId);
        }
        return new ProductSnapshot(p.id(), p.name(), p.price());
    }
}