package com.example.order.dto;

import lombok.Data;

@Data
public class CartItemDto {
    private Long id;          // cartItem id (필요 없으면 생략)
    private Long productId;
    private String name;      // productName
    private long price;       // unitPrice
    private int quantity;
}