package com.example.product.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;


@Entity
public class ProductMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;


    @Column(unique = true, nullable = false)
    private String messageId = UUID.randomUUID().toString();

    public ProductMessage() {}

 public ProductMessage(Long id, String name, String description, Double price, Integer stock) {
  this.id = id;
  this.name = name;
  this.description = description;
  this.price = price;
  this.stock = stock;
  this.messageId = "msg-" + id; // 메시지 ID는 상품 ID를 기준으로 생성하거나 UUID 등으로 생성
 }

 public Long getId() {
  return id;
 }

 public void setId(Long id) {
  this.id = id;
 }

 public String getName() {
  return name;
 }

 public void setName(String name) {
  this.name = name;
 }

 public String getDescription() {
  return description;
 }

 public void setDescription(String description) {
  this.description = description;
 }

 public Double getPrice() {
  return price;
 }

 public void setPrice(Double price) {
  this.price = price;
 }

 public Integer getStock() {
  return stock;
 }

 public void setStock(Integer stock) {
  this.stock = stock;
 }

 public String getMessageId() { return messageId; }
 public void setMessageId(String messageId) { this.messageId = messageId; }

}
