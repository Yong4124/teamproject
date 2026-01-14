package com.example.orderlist.repository;

import com.example.orderlist.model.OrderItem;
import com.example.orderlist.model.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdersRepository extends JpaRepository<Orders, Long> {
}
