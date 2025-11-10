package com.example.product.repository;

import com.example.product.model.ProductMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductMessageRepository extends JpaRepository<ProductMessage,Long>{
    boolean existsByMessageId(String messageId);
}
