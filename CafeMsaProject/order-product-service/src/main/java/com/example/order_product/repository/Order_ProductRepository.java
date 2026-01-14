package com.example.order_product.repository;

import com.example.order_product.model.Order_Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Order_ProductRepository extends JpaRepository<Order_Product, Long> {
    Page<Order_Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
