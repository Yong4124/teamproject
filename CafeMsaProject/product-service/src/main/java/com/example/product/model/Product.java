package com.example.product.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 기본 정보
    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Double price;

    private Integer stock;

    @Column(length = 50)
    private String category;

    // 상세 스펙
    @Column(length = 50)
    private String size;

    @Column(length = 50)
    private String calorie;

    @Column(length = 500)
    private String description;

    @Column(length = 100)
    private String allergy;

    @Column(length = 50)
    private String fat;

    @Column(length = 50)
    private String sugar;

    @Column(length = 50)
    private String sodium;

    @Column(length = 50)
    private String protein;

    @Column(length = 50)
    private String caffeine;

    @Column(name = "image_url", length = 500)
    private String imageUrl;
}
