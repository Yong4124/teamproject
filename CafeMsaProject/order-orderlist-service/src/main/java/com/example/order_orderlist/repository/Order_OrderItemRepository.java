package com.example.order_orderlist.repository;

import com.example.order_orderlist.model.Order_OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Order_OrderItemRepository extends JpaRepository<Order_OrderItem, Long> {
}
