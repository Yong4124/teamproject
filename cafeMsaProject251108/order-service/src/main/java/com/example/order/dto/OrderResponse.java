package com.example.order.dto;

import java.util.List;

public record OrderResponse(
        Long id,
        int totalQuantity,
        long totalAmount,
        String status,
        List<OrderItemResponse> items
) {}