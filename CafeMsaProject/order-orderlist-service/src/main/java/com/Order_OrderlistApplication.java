package com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class Order_OrderlistApplication {
    public static void main(String[] args) {
        SpringApplication.run(Order_OrderlistApplication.class, args);
    }
}