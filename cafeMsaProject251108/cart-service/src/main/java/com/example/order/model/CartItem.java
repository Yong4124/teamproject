package com.example.order.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CART_ITEMS",
        indexes = {
                @Index(name = "idx_cartitem_cart_id", columnList = "cart_id"),
                @Index(name = "idx_cartitem_product_id", columnList = "productId")
        })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** MSA: Product 서비스의 식별자만 보유 */
    @Column(nullable = false)
    private Long productId;

    /** 스냅샷 정보(리스트/주문 상세 표시용) */
    @Column(nullable = false, length = 200)
    private String productName;

    /** 단가 스냅샷(원) — 주문 시점 가격 고정 */
    @Column(nullable = false)
    private Long unitPrice;

    /** 수량 */
    @Column(nullable = false)
    private Integer quantity;

    /** 옵션이 있다면 JSON 등으로 보관 가능 (선택) */
    @Column(columnDefinition = "TEXT")
    private String optionsJson;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id")
    private Cart cart;
}
