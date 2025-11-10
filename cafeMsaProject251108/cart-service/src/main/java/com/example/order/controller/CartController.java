// src/main/java/com/example/cart/controller/CartController.java
package com.example.order.controller;

import com.example.order.dto.AddCartItemRequest;
import com.example.order.dto.CartItemResponse;
import com.example.order.dto.UpdateQuantityRequest;
import com.example.order.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Cart REST Controller
 * - 모든 요청에 X-USER-ID 헤더 필요
 * - 경로/메서드는 프런트(cart.js)와 1:1 매칭
 *
 *   GET    /api/cart/items            : 장바구니 목록
 *   POST   /api/cart/items            : 담기
 *   PUT    /api/cart/items/{itemId}   : 수량 변경
 *   DELETE /api/cart/items/{itemId}   : 항목 삭제
 *   DELETE /api/cart                  : 전체 비우기 (옵션)
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /** 목록 조회 */
    @GetMapping("/items")
    public ResponseEntity<List<CartItemResponse>> list(
            @RequestHeader("X-USER-ID") Long userId
    ) {
        return ResponseEntity.ok(cartService.listItems(userId));
    }

    /** 담기 */
    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> add(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody AddCartItemRequest req
    ) {
        CartItemResponse saved = cartService.addItem(userId, req);
        return ResponseEntity.ok(saved);
    }

    /** 수량 변경 */
    @PutMapping("/items/{id}")
    public ResponseEntity<CartItemResponse> change(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable("id") Long itemId,
            @RequestBody UpdateQuantityRequest req
    ) {
        CartItemResponse updated = cartService.updateQuantity(userId, itemId, req);
        return ResponseEntity.ok(updated);
    }

    /** 항목 삭제 */
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> remove(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable("id") Long itemId
    ) {
        cartService.removeItem(userId, itemId);
        return ResponseEntity.noContent().build();
    }

    /** (옵션) 장바구니 전체 비우기 */
    @DeleteMapping
    public ResponseEntity<Void> clear(
            @RequestHeader("X-USER-ID") Long userId
    ) {
        cartService.clear(userId);
        return ResponseEntity.noContent().build();
    }

    /* ---- 예외 처리(선택) : 메시지/상태코드 깔끔하게 ---- */

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNotFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }

    @PostMapping("/api/cart/clear")
    public ResponseEntity<?> clear(@RequestHeader(name = "X-USER-ID", required = false) String xUserId) {

        if (xUserId == null || xUserId.isBlank()) {
            throw new IllegalArgumentException("X-USER-ID 헤더가 필요합니다.");
        }
        Long uid = Long.parseLong(xUserId);

        cartService.clear(uid);
        return ResponseEntity.ok(java.util.Map.of("success", true));
    }}
