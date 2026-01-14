package com.example.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateQuantityRequest {
    @NotNull
    @Min(0)   // 0 허용(=삭제), 음수 금지
    private Integer quantity;
}
