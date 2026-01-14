package com.example.cart.service;

public interface ProductLookup {
    ProductSnapshot getSnapshot(Long productId);
    record ProductSnapshot(Long id, String name, Long price) {}
}
