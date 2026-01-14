package com.example.order.model;


import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "ORDER_ITEMS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id")
    private Order order;

    private Long productId;
    private String productName;
    private long unitPrice;
    private int quantity;

    public long subtotal() { return unitPrice * quantity; }
}
