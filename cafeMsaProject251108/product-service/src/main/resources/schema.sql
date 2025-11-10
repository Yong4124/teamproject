CREATE TABLE IF NOT EXISTS PRODUCTS (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price DOUBLE NOT NULL,
    stock INT,
    category VARCHAR(50)  -- ✅ 새 필드
    );
