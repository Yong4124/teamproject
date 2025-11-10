package com.example.order.dto;

public record OrderItemResponse(
        Long productId,
        String productName,
        long unitPrice,
        int quantity
) {}