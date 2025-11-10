package com.example.order.dto;

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
}