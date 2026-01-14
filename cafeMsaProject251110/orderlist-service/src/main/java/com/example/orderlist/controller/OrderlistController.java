package com.example.orderlist.controller;

import com.example.orderlist.model.OrderRequest;
import com.example.orderlist.model.OrderResponse;
import com.example.orderlist.model.Orders;
import com.example.orderlist.model.OrderItem;
import com.example.orderlist.repository.OrdersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orderlist")
@RequiredArgsConstructor
public class OrderlistController {

    private final OrdersRepository ordersRepository;

    // 🔥 발주 생성
    @PostMapping
    public OrderResponse createOrder(@RequestBody OrderRequest request) {

        Orders order = new Orders();
        order.setOrderDate(LocalDateTime.now());

        order.setItems(new ArrayList<>());

        for (OrderRequest.Item i : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId((long) i.getProductId());
            item.setProductName(i.getProductName());
            item.setQuantity(i.getQuantity());
            item.setPrice((double) i.getPrice());
            item.setOrder(order);

            order.getItems().add(item);
        }

        Orders saved = ordersRepository.save(order);

        return new OrderResponse(saved);  // DTO에서 합계 계산
    }

    // 🔥 전체 발주 내역 조회
    @GetMapping
    public List<OrderResponse> getOrders() {
        return ordersRepository.findAll()
                .stream()
                .map(OrderResponse::new)  // DTO에서 합계 계산
                .toList();
    }
}
