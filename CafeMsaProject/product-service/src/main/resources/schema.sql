DROP TABLE IF EXISTS ORDER_PRODUCT;

CREATE TABLE ORDER_PRODUCT (
                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               name VARCHAR(255) NOT NULL,
                               price DOUBLE NOT NULL,
                               size VARCHAR(50),
                               calorie VARCHAR(50),
                               description VARCHAR(1000),
                               allergy VARCHAR(255),
                               fat VARCHAR(50),
                               sugar VARCHAR(50),
                               sodium VARCHAR(50),
                               protein VARCHAR(50),
                               caffeine VARCHAR(50),
                               image_url VARCHAR(255)
);
