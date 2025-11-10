package com.example.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.NoSuchElementException;

@Service
@Profile({"default","local","dev","prod"}) // ← 일반 실행에서 활성
@RequiredArgsConstructor
public class HttpProductLookup implements CartService.ProductLookup {

    private final WebClient productWebClient;

    record ProductDto(Long id, String name, Long price, Boolean available) {}

    @Override
    public CartService.ProductSnapshot getSnapshot(Long productId) {
        ProductDto p = productWebClient.get()
                .uri("/api/products/{id}", productId)   // 상품 서비스 실제 엔드포인트에 맞추세요
                .retrieve()
                .bodyToMono(ProductDto.class)
                .block();

        if (p == null || Boolean.FALSE.equals(p.available()))
            throw new NoSuchElementException("구매 불가/없음: " + productId);

        return new CartService.ProductSnapshot(p.id(), p.name(), p.price());
    }
}