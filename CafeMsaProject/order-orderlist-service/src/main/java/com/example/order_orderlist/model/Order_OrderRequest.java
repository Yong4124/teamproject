package com.example.order_orderlist.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class Order_OrderRequest {

    private List<Item> items;

    public int calculateTotal() {
        return items.stream()
                .mapToInt(i -> i.getPrice() * i.getQuantity())
                .sum();
    }

    @Getter
    @Setter
    public static class Item {
        private int productId;
        private String productName;
        private int quantity;
        private int price;
    }
}
