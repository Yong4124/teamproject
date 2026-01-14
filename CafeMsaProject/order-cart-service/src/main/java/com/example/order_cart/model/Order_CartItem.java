package com.example.order_cart.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ORDER_CARTITEM")
@Data
public class Order_CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;
    private String productName;
    private Integer quantity;
    private Double price;

}