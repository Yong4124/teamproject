package com.example.order_orderlist.controller;

import com.example.order_orderlist.model.Order_OrderItem;
import com.example.order_orderlist.model.Order_OrderRequest;
import com.example.order_orderlist.model.Order_OrderResponse;
import com.example.order_orderlist.model.Order_Orders;
import com.example.order_orderlist.repository.Order_OrdersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/order_orderlist")
@RequiredArgsConstructor
public class Order_OrderlistController {

    private final Order_OrdersRepository ordersRepository;
    private final RabbitTemplate rabbitTemplate;

    // 🔥 발주 생성
    @PostMapping
    public Order_OrderResponse createOrder(@RequestBody Order_OrderRequest request) {

        Order_Orders order = new Order_Orders();
        order.setOrderDate(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        for (Order_OrderRequest.Item i : request.getItems()) {
            Order_OrderItem item = new Order_OrderItem();
            item.setProductId((long) i.getProductId());
            item.setProductName(i.getProductName());
            item.setQuantity(i.getQuantity());
            item.setPrice((double) i.getPrice());
            item.setOrder(order);
            order.getItems().add(item);
        }

        // 주문 데이터 DB에 저장
        Order_Orders savedOrder = ordersRepository.save(order);

        // 발주 요청 큐로 전송 (비동기 처리)
        rabbitTemplate.convertAndSend("order.request.queue", request.getItems());

        return new Order_OrderResponse(savedOrder);  // DTO 반환
    }

    // 🔥 전체 발주 내역 조회
    @GetMapping
    public List<Order_OrderResponse> getOrders() {
        return ordersRepository.findAll()
                .stream()
                .map(Order_OrderResponse::new)  // DTO에서 합계 계산
                .toList();
    }
}
