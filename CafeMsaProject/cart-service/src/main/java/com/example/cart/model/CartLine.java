// model/CartLine.java
package com.example.cart.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CART_LINES",
        uniqueConstraints = @UniqueConstraint(name="uk_user_product_open", columnNames = {"user_id","product_id","status"}))
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class CartLine {

    public enum Status { OPEN }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable=false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=16)
    private Status status = Status.OPEN;

    @Column(name="product_id", nullable=false)
    private Long productId;

    @Column(nullable=false)
    private String productName;

    @Column(nullable=false)
    private Long price; // 스냅샷

    @Column(nullable=false)
    private Integer quantity;
}
