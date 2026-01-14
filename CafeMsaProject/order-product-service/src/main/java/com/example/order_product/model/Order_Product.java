package com.example.order_product.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ORDER_PRODUCT")
@Data
public class Order_Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double price;
    private String size;
    private String calorie;
    private String description;
    private String allergy;
    private String fat;
    private String sugar;
    private String sodium;
    private String protein;
    private String caffeine;
    @Column(name = "image_url")
    private String imageUrl;
}