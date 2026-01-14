-- ============================
-- CARTITEM 테이블 생성
-- ============================
CREATE TABLE IF NOT EXISTS CARTITEM
(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,  -- 새로 추가된 컬럼
    quantity INT NOT NULL,
    price DOUBLE NOT NULL,
    cart_id BIGINT
    );
