package com.example.product.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "REVIEWS")
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 리뷰 ID

    @Column(nullable = false)
    private String author; // 작성자 이름

    @Column(nullable = false, length = 1000)
    private String content; // 리뷰 내용

//    @Column(nullable = false)
//    private int rating; // 평점 (1~5)

    @Column(nullable = false)
    private Long productId; // 어떤 상품에 대한 리뷰인지 (상품 ID)

    @Column(nullable = false)
    private LocalDateTime createdAt; // 작성일



} 