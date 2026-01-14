package com.example.order_cart.dto;

public class Order_ProductInfo {
    private Long id;
    private String name;
    private Double price; // Product와 동일하게 Double로

    public Order_ProductInfo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}
