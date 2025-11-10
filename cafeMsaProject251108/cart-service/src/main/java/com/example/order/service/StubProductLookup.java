// src/main/java/com/example/cart/service/StubProductLookup.java
package com.example.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * 개발용 임시 구현: 실서비스에서는 WebClient/Feign으로 교체
 */
@Component
@Profile("stub")
@RequiredArgsConstructor
public class StubProductLookup implements CartService.ProductLookup {
    @Override
    public CartService.ProductSnapshot getSnapshot(Long productId) {
        // TODO: product-service 호출로 교체
        // 임시 더미 데이터
        long price = switch (String.valueOf(productId)) {
            case "1" -> 2000L;
            case "2" -> 3000L;
            default -> 2500L;
        };
        String name = switch (String.valueOf(productId)) {
            case "1" -> "아메리카노";
            case "2" -> "카라멜마끼야또";
            default -> "아이스티";
        };
        return new CartService.ProductSnapshot(productId, name, price);
    }
}
