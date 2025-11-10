package com.example.order.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CARTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** MSA 환경: 외부 인증/회원 서비스의 사용자 식별자 */
    @Column(nullable = false)
    private Long userId;

    /** OPEN(진행 중), ORDERED(주문 완료), ABANDONED(이탈) 등 */
    @Column(nullable = false, length = 20)
    private String status;

    /** 총 수량/총 금액 캐시(성능용) */
    @Column(nullable = false)
    private Integer totalQuantity;

    @Column(nullable = false)
    private Long totalAmount; // 원화 정수(가격 * 수량 합)

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /** 합계 재계산 유틸 */
    public void recalcTotals() {
        int qty = 0;
        long amt = 0L;
        for (CartItem it : items) {
            int q = (it.getQuantity() == null ? 0 : it.getQuantity());
            long p = (it.getUnitPrice() == null ? 0L : it.getUnitPrice());
            qty += q;
            amt += p * q;
        }
        this.totalQuantity = qty;
        this.totalAmount = amt;
    }

    /** 아이템 추가 편의 메서드 */
    public void addItem(CartItem item) {
        item.setCart(this);
        this.items.add(item);
        recalcTotals();
    }

    /** 아이템 제거 편의 메서드 */
    public void removeItem(CartItem item) {
        this.items.remove(item);
        item.setCart(null);
        recalcTotals();
    }
}