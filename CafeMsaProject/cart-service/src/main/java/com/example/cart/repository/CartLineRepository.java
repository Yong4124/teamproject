package com.example.cart.repository;


import com.example.cart.model.CartLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartLineRepository extends JpaRepository<CartLine, Long> {
    List<CartLine> findByUserIdAndStatus(Long userId, CartLine.Status status);
    Optional<CartLine> findByUserIdAndStatusAndProductId(Long userId, CartLine.Status status, Long productId);

    @Modifying
    @Query("delete from CartLine l where l.userId=:userId and l.status=:status")
    void deleteAllByUserAndStatus(@Param("userId") Long userId, @Param("status") CartLine.Status status);
}