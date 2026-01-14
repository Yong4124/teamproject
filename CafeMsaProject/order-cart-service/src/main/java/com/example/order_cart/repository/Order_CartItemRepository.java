package com.example.order_cart.repository;

import com.example.order_cart.model.Order_CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Order_CartItemRepository extends JpaRepository<Order_CartItem, Long> {
}
