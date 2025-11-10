package com.example.order.service;

import com.example.order.dto.AddCartItemRequest;
import com.example.order.dto.CartItemResponse;
import com.example.order.dto.UpdateQuantityRequest;
import com.example.order.model.Cart;
import com.example.order.model.CartItem;
import com.example.order.repository.CartItemRepository;
import com.example.order.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductLookup productLookup; // 상품 스냅샷 조회

    private static final String STATUS_OPEN = "OPEN";

    public Cart getOrCreateOpenCart(Long userId) {
        return cartRepository.findByUserIdAndStatus(userId, STATUS_OPEN)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .userId(userId)
                                .status(STATUS_OPEN)
                                .totalAmount(0L)
                                .totalQuantity(0)
                                .build()
                ));
    }

    @Transactional(readOnly = true)
    public List<CartItemResponse> listItems(Long userId) {
        Cart cart = getOrCreateOpenCart(userId);
        return cartItemRepository.findByCart_Id(cart.getId()).stream()
                .map(ci -> new CartItemResponse(
                        ci.getId(),
                        ci.getProductId(),
                        ci.getProductName(),
                        ci.getUnitPrice(),
                        ci.getQuantity()
                ))
                .toList();
    }

    /** ✅ 담기: 저장 후 방금 상태를 CartItemResponse로 반환 */
    public CartItemResponse addItem(Long userId, AddCartItemRequest req) {
        if (req.getProductId() == null || req.getQuantity() == null || req.getQuantity() < 1) {
            throw new IllegalArgumentException("productId/quantity가 올바르지 않습니다.");
        }

        Cart cart = getOrCreateOpenCart(userId);

        // 기존 동일 상품이면 수량만 증가
        CartItem exist = cartItemRepository.findByCart_IdAndProductId(cart.getId(), req.getProductId()).orElse(null);
        if (exist != null) {
            exist.setQuantity(exist.getQuantity() + req.getQuantity());
            cart.recalcTotals();
            return new CartItemResponse(
                    exist.getId(), exist.getProductId(), exist.getProductName(),
                    exist.getUnitPrice(), exist.getQuantity()
            );
        }

        // 신규 추가
        ProductSnapshot snap = productLookup.getSnapshot(req.getProductId());
        CartItem item = CartItem.builder()
                .cart(cart)
                .productId(snap.id())
                .productName(snap.name())
                .unitPrice(snap.price())
                .quantity(req.getQuantity())
                .build();

        cartItemRepository.save(item);
        cart.getItems().add(item);
        cart.recalcTotals();

        return new CartItemResponse(
                item.getId(), item.getProductId(), item.getProductName(),
                item.getUnitPrice(), item.getQuantity()
        );
    }

    /** ✅ 수량 변경: 변경 후 CartItemResponse 반환 */
    public CartItemResponse updateQuantity(Long userId, Long cartItemId, UpdateQuantityRequest req) {
        if (req.getQuantity() == null || req.getQuantity() < 1) {
            throw new IllegalArgumentException("quantity는 1 이상이어야 합니다.");
        }

        Cart cart = getOrCreateOpenCart(userId);
        CartItem item = cartItemRepository.findByIdAndCart_Id(cartItemId, cart.getId())
                .orElseThrow(() -> new NoSuchElementException("장바구니 항목을 찾을 수 없습니다."));

        item.setQuantity(req.getQuantity());
        cart.recalcTotals();

        return new CartItemResponse(
                item.getId(), item.getProductId(), item.getProductName(),
                item.getUnitPrice(), item.getQuantity()
        );
    }

    public void removeItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateOpenCart(userId);
        CartItem item = cartItemRepository.findByIdAndCart_Id(cartItemId, cart.getId())
                .orElseThrow(() -> new NoSuchElementException("장바구니 항목을 찾을 수 없습니다."));
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        cart.recalcTotals();
    }

    public void clear(Long userId) {
        Cart cart = getOrCreateOpenCart(userId);
        cartItemRepository.deleteAll(cartItemRepository.findByCart_Id(cart.getId()));
        cart.getItems().clear();
        cart.recalcTotals();
    }

    /* -------- 상품 서비스 조회 포트 -------- */
    public record ProductSnapshot(Long id, String name, Long price) {}
    public interface ProductLookup { ProductSnapshot getSnapshot(Long productId); }


}


