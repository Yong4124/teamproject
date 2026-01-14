// src/main/java/com/example/cart/controller/CartController.java
package com.example.cart.controller;

import com.example.cart.dto.AddCartItemRequest;
import com.example.cart.dto.CartItemResponse;
import com.example.cart.dto.UpdateQuantityRequest;
import com.example.cart.service.CartUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartUseCase cart; // 또는 CartUseCase로 주입받아도 됩니다.

    // 공통: 헤더 파싱
    private Long uid(String xUserId) {
        if (xUserId == null || xUserId.isBlank()) {
            throw new IllegalArgumentException("X-USER-ID 헤더가 필요합니다.");
        }
        try {
            return Long.parseLong(xUserId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("X-USER-ID 헤더는 숫자여야 합니다.");
        }
    }

    /** 목록 조회 */
    @GetMapping("/items")
    public ResponseEntity<List<CartItemResponse>> list(
            @RequestHeader("X-USER-ID")
            String xUserId

    ) {
        return ResponseEntity.ok(cart.list(uid(xUserId)));
    }

    /** 담기 */
    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> add(
            @RequestHeader("X-USER-ID") String xUserId,
            @Valid @RequestBody AddCartItemRequest req
    ) {
        CartItemResponse saved = cart.add(uid(xUserId), req);
        return ResponseEntity.ok(saved);
    }

    /** 수량 변경 (0이면 삭제 → 204) */
    @PutMapping("/items/{id}")
    public ResponseEntity<CartItemResponse> change(
            @RequestHeader("X-USER-ID") String xUserId,
            @PathVariable("id") Long itemId,
            @Valid @RequestBody UpdateQuantityRequest req
    ) {
        // 1) 방어 로직: null/음수 처리
        Integer q = req.getQuantity();
        if (q == null) throw new IllegalArgumentException("quantity가 필요합니다.");
        if (q < 0) throw new IllegalArgumentException("quantity는 0 이상이어야 합니다.");

        // 2) 0이면 삭제 → 204
        if (q == 0) {
            cart.remove(uid(xUserId), itemId);
            return ResponseEntity.noContent().build();
        }

        // 3) 정상 업데이트
        CartItemResponse updated = cart.updateQty(uid(xUserId), itemId, req);

        // 서비스에서 '합치기→삭제됨' 같은 정책이 있어 removed=true를 줄 수도 있으니 한 번 더 방어
        if (updated == null || updated.isRemoved()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(updated);
    }

    /** 항목 삭제 */
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> remove(
            @RequestHeader("X-USER-ID") String xUserId,
            @PathVariable("id") Long itemId
    ) {
        cart.remove(uid(xUserId), itemId);
        return ResponseEntity.noContent().build();
    }

    /** 장바구니 전체 비우기 */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clear(
            @RequestHeader("X-USER-ID") String xUserId
    ) {
        cart.clear(uid(xUserId));
        return ResponseEntity.noContent().build();
    }

    /* ---- 예외 처리 ---- */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNotFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
}
