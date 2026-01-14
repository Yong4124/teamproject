package com.example.cart.service;

import com.example.cart.dto.AddCartItemRequest;
import com.example.cart.dto.CartItemResponse;
import com.example.cart.dto.UpdateQuantityRequest;

import java.util.List;

public interface CartUseCase {
    List<CartItemResponse> list(Long userId);
    CartItemResponse add(Long userId, AddCartItemRequest req);
    CartItemResponse updateQty(Long userId, Long itemId, UpdateQuantityRequest req);
    void remove(Long userId, Long itemId);
    void clear(Long userId);
}