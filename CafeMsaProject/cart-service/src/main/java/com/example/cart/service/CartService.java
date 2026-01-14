// src/main/java/com/example/cart/service/CartServiceSingle.java
package com.example.cart.service;

import com.example.cart.dto.AddCartItemRequest;
import com.example.cart.dto.CartItemResponse;
import com.example.cart.dto.UpdateQuantityRequest;

import com.example.cart.model.CartLine;
import com.example.cart.repository.CartLineRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService implements CartUseCase{

    private final CartLineRepository repo;
    private final ProductLookup productLookup; // 상품 스냅샷 조회 (분리된 인터페이스)

    @Transactional(readOnly = true)
    public List<CartItemResponse> list(Long userId) {
        return repo.findByUserIdAndStatus(userId, CartLine.Status.OPEN)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CartItemResponse add(Long userId, AddCartItemRequest req) {
        // quantity null/음수 보정: 기본 1
        int addQty = (req.getQuantity() == null || req.getQuantity() < 1) ? 1 : req.getQuantity();

        var line = repo.findByUserIdAndStatusAndProductId(userId, CartLine.Status.OPEN, req.getProductId())
                .orElseGet(() -> {
                    var p = productLookup.getSnapshot(req.getProductId());
                    return CartLine.builder()
                            .userId(userId).status(CartLine.Status.OPEN)
                            .productId(p.id()).productName(p.name()).price(p.price())
                            .quantity(0)
                            .build();
                });

        line.setQuantity((line.getQuantity() == null ? 0 : line.getQuantity()) + addQty);
        repo.save(line);

        return toResponse(line);
    }

    public CartItemResponse updateQty(Long userId, Long itemId, UpdateQuantityRequest req) {
        var line = repo.findById(itemId).orElseThrow();

        // 내 항목인지 확인
        if (!line.getUserId().equals(userId))
            throw new IllegalArgumentException("권한 없음");

        int q = (req.getQuantity() == null ? 0 : Math.max(0, req.getQuantity()));
        if (q == 0) {
            repo.delete(line);                       // 0이면 삭제 정책
            return CartItemResponse.removed(itemId); // 또는 컨트롤러에서 204로 처리 가능
        }

        line.setQuantity(q);
        return toResponse(line);
    }

    public void remove(Long userId, Long itemId) {
        repo.findById(itemId)
                .filter(l -> l.getUserId().equals(userId))
                .ifPresent(repo::delete);
    }

    public void clear(Long userId) {
        repo.deleteAllByUserAndStatus(userId, CartLine.Status.OPEN);
    }

    private CartItemResponse toResponse(CartLine l) {
        return CartItemResponse.of(l.getId(), l.getProductId(), l.getProductName(), l.getPrice(), l.getQuantity());
    }
}
