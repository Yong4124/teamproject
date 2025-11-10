package com.example.order.service;


import com.example.order.dto.CartItemDto;
import com.example.order.model.Order;
import com.example.order.model.OrderItem;
import com.example.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public Order createFromCart(Long userId, List<CartItemDto> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("장바구니가 비었습니다.");
        }

        Order order = new Order();
        order.setUserId(userId);

        int totalQty = 0;
        long totalAmt = 0;

        for (CartItemDto c : cartItems) {
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(c.getProductId())
                    .productName(c.getName())
                    .unitPrice(c.getPrice())
                    .quantity(c.getQuantity())
                    .build();
            order.getItems().add(item);

            totalQty += c.getQuantity();
            totalAmt += (long) c.getPrice() * c.getQuantity();
        }

        order.setTotalQuantity(totalQty);
        order.setTotalAmount(totalAmt);
        order.setStatus("NEW");

        return orderRepository.save(order);
    }
}