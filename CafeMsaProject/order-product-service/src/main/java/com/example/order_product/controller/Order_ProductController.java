package com.example.order_product.controller;

import com.example.order_product.model.Order_Product;
import com.example.order_product.repository.Order_ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order_products")
@RequiredArgsConstructor
public class Order_ProductController {

    private final Order_ProductRepository productRepository;

    // ============================
    // 🔹 상품 전체 조회 (페이징)
    // ============================
    @GetMapping
    public Page<Order_Product> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        Pageable pageable = PageRequest.of(page, size);

        if (keyword != null && !keyword.isEmpty()) {
            return productRepository.findByNameContainingIgnoreCase(keyword, pageable); // ❌ 여기 수정
        } else {
            return productRepository.findAll(pageable);
        }
    }



    // ============================
    // 🔹 단일 상품 조회
    // ============================
    @GetMapping("/{id}")
    public Order_Product getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));
    }
}
