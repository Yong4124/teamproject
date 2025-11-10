package com.example.product.controller;


import com.example.product.model.Review;
import com.example.product.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewRepository reviewRepository;

    @Autowired // 생성자 주입을 사용하는 것이 좋습니다.
    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public List<Review> listAll(){
        return reviewRepository.findAll();
    }

    // 변경된 부분: URL 경로에 productId를 포함하고, @PathVariable로 받습니다.
    // GET /api/reviews/product/{productId} 요청을 처리합니다.
    @GetMapping("/product/{productId}")
    public List<Review> listByProduct(@PathVariable Long productId) {
        return reviewRepository.findByProductIdOrderByIdDesc(productId);
    }

    @GetMapping(params = "productId")
    public List<Review> listByProductQuery(@RequestParam Long productId) {
        return reviewRepository.findByProductIdOrderByIdDesc(productId);
    }




} 