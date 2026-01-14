package com.example.order_cart.controller;

import com.example.order_cart.dto.Order_ProductInfo;
import com.example.order_cart.model.Order_CartItem;
import com.example.order_cart.repository.Order_CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/order_carts")
@RequiredArgsConstructor
public class Order_CartController {

    private final Order_CartItemRepository cartItemRepository;
    private final RabbitTemplate rabbitTemplate;

    // ============================
    // 장바구니 전체 조회
    // ============================
    @GetMapping
    public List<Order_CartItem> getAllItems() {
        return cartItemRepository.findAll();
    }

    // ============================
    // 장바구니 항목 추가
    // ============================
    @PostMapping("/{productId}")
    public ResponseEntity<Order_CartItem> addItemByProductId(
            @PathVariable Long productId,
            @RequestBody(required = false) Order_CartItem requestItem
    ) {
        int quantity = (requestItem != null && requestItem.getQuantity() > 0)
                ? requestItem.getQuantity()
                : 1;

        // 기존 아이템이 있으면 수량만 증가
        return cartItemRepository.findAll().stream()
                .filter(i -> productId.equals(i.getProductId()))
                .findFirst()
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + quantity);
                    return ResponseEntity.ok(cartItemRepository.save(existing));
                })
                .orElseGet(() -> {
                    // product-service에서 상품 정보 가져오기
                    RestTemplate restTemplate = new RestTemplate();
                    Order_ProductInfo product = restTemplate.getForObject(
                            "http://localhost:8000/api/order_products/" + productId,
                            Order_ProductInfo.class
                    );

                    Order_CartItem newItem = new Order_CartItem();
                    newItem.setProductId(product.getId());
                    newItem.setProductName(product.getName());
                    newItem.setPrice(product.getPrice());
                    newItem.setQuantity(quantity);

                    return ResponseEntity.ok(cartItemRepository.save(newItem));
                });
    }

    // ============================
    // 장바구니 항목 수정
    // ============================
    @PutMapping("/{id}")
    public ResponseEntity<Order_CartItem> updateItem(
            @PathVariable Long id,
            @RequestBody Order_CartItem updatedItem) {

        return cartItemRepository.findById(id)
                .map(item -> {
                    item.setProductId(updatedItem.getProductId());
                    item.setProductName(updatedItem.getProductName());
                    item.setQuantity(updatedItem.getQuantity());
                    item.setPrice(updatedItem.getPrice());
                    return ResponseEntity.ok(cartItemRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ============================
    // 장바구니 항목 삭제
    // ============================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        if (!cartItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cartItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ============================
    // 장바구니 전체 삭제
    // ============================
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllItems() {
        cartItemRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    // ============================
    // 🔹 발주 요청 (RabbitMQ)
    // ============================
    @PostMapping("/checkout")
    public ResponseEntity<String> checkout() {
        List<Order_CartItem> cartItems = cartItemRepository.findAll();
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body("장바구니가 비었습니다.");
        }

        // RabbitMQ로 발주 요청 전송 (Order_CartItem 리스트 그대로)
        rabbitTemplate.convertAndSend("order.request.queue", cartItems);

        // 발주 후 장바구니 비우기
        cartItemRepository.deleteAll();

        return ResponseEntity.ok("발주 요청이 큐에 전송되었습니다.");
    }
}
