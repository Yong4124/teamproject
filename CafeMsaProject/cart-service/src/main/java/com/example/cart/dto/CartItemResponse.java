package com.example.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String name;     // 프런트 cart.js가 기대하는 필드명
    private Long price;      // = unitPrice
    private Integer quantity;
    private boolean removed;

    public static CartItemResponse of(Long id, Long pid, String name, Long price, Integer q) {
        return new CartItemResponse(id, pid, name, price, q, false);
    }
    public static CartItemResponse removed(Long id) { // ★ 팩토리 추가
        return new CartItemResponse(id, null, null, null, 0, true);
    }
}