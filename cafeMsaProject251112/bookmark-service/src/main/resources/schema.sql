CREATE TABLE IF NOT EXISTS BOOKMARKS (
                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                         user_id BIGINT NOT NULL,
                                         product_id BIGINT NOT NULL,
                                         product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
