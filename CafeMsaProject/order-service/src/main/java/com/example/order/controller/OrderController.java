package com.example.order.controller;

import com.example.order.dto.CartItemDto;
import com.example.order.dto.OrderItemResponse;
import com.example.order.dto.OrderResponse;
import com.example.order.model.Order;
import com.example.order.repository.OrderRepository;
import com.example.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/orders", produces = "application/json")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    private Long currentUserId(String xUserId) {
        if (xUserId == null || xUserId.isBlank())
            throw new IllegalArgumentException("X-USER-ID 헤더가 필요합니다.");
        return Long.parseLong(xUserId);
    }

    /** 주문 생성: 장바구니 아이템을 받아 주문을 만들고 DTO로 반환 */
    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @RequestHeader(name = "X-USER-ID", required = false) String xUserId,
            @RequestBody List<CartItemDto> items) {
        Long uid = currentUserId(xUserId);
        Order saved = orderService.createFromCart(uid, items);
        return ResponseEntity.ok(toDto(saved));
    }

    /** 주문 상세 조회 */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> get(
            @RequestHeader(name = "X-USER-ID", required = false) String xUserId,
            @PathVariable Long orderId) {
        Long uid = currentUserId(xUserId);
        Order o = orderRepository.findById(orderId).orElseThrow();
        if (!o.getUserId().equals(uid)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(toDto(o));
    }

    /** 내 주문 목록 */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> myOrders(
            @RequestHeader(name = "X-USER-ID", required = false) String xUserId) {
        Long uid = currentUserId(xUserId);
        List<OrderResponse> list = orderRepository.findByUserIdOrderByIdDesc(uid)
                .stream().map(this::toDto).toList(); // Java 17
        return ResponseEntity.ok(list);
    }

    // === 엔티티 -> DTO 변환 ===
    private OrderResponse toDto(Order o) {
        var items = o.getItems().stream()
                .map(it -> new OrderItemResponse(
                        it.getProductId(),
                        it.getProductName(),
                        it.getUnitPrice(),
                        it.getQuantity()))
                .toList();
        return new OrderResponse(
                o.getId(),
                o.getTotalQuantity(),
                o.getTotalAmount(),
                o.getStatus(),
                items
        );
    }
}
