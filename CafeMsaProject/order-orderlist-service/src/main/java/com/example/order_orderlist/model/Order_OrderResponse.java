package com.example.order_orderlist.model;

import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class Order_OrderResponse {

    private Long id;
    private LocalDateTime orderDate;
    private List<ItemResponse> items;
    private int totalPrice; // 합계는 DTO에서 계산

    public Order_OrderResponse(Order_Orders order) {
        this.id = order.getId();
        this.orderDate = order.getOrderDate();
        this.items = order.getItems().stream()
                .map(ItemResponse::new)
                .toList();

        // 합계 계산
        this.totalPrice = items.stream()
                .mapToInt(i -> (int) (i.getPrice() * i.getQuantity()))
                .sum();
    }

    @Getter
    public static class ItemResponse {
        private String productName;
        private int quantity;
        private double price;

        public ItemResponse(Order_OrderItem item) {
            this.productName = item.getProductName();
            this.quantity = item.getQuantity();
            this.price = item.getPrice();
        }
    }
}
