package com.example.orderlist.controller;

import com.example.orderlist.model.CartItem;
import com.example.orderlist.repository.CartItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartItemRepository cartItemRepository;

    public CartController(CartItemRepository cartItemRepository) {
        this.cartItemRepository = cartItemRepository;
    }

    // ✅ 장바구니 전체 조회
    @GetMapping
    public List<CartItem> getAllItems() {
        return cartItemRepository.findAll();
    }

    // ✅ 장바구니 항목 추가
    @PostMapping
    public CartItem addItem(@RequestBody CartItem newItem) {
        return cartItemRepository.save(newItem);
    }

    // ✅ 장바구니 항목 수정
    @PutMapping("/{id}")
    public ResponseEntity<CartItem> updateItem(
            @PathVariable Long id,
            @RequestBody CartItem updatedItem) {

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

    // ✅ 장바구니 항목 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        if (!cartItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cartItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
