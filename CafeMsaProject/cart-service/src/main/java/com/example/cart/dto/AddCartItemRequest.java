package com.example.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor // ✅ Jackson 역직렬화에 필요
public class AddCartItemRequest {

    @NotNull(message = "productId는 필수입니다.")
    private Long productId;

    @Min(value = 1, message = "quantity는 1 이상이어야 합니다.")
    private Integer quantity; // ✅ null 가능 → 서비스에서 기본값 처리
}