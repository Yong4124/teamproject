-- ===============================
-- CARTS (장바구니 헤더)
-- ===============================
DROP TABLE IF EXISTS CART_ITEMS;
DROP TABLE IF EXISTS CARTS;

CREATE TABLE CARTS (
                       id             BIGINT AUTO_INCREMENT PRIMARY KEY,
                       user_id        BIGINT      NOT NULL,
                       status         VARCHAR(20) NOT NULL DEFAULT 'OPEN',
                       total_quantity INT         NOT NULL DEFAULT 0,
                       total_amount   BIGINT      NOT NULL DEFAULT 0,
                       created_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
                       updated_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- CART_ITEMS (장바구니 상세)
-- ===============================
CREATE TABLE CART_ITEMS (
     id            BIGINT AUTO_INCREMENT PRIMARY KEY,
     cart_id       BIGINT       NOT NULL,
     product_id    BIGINT       NOT NULL,
     product_name  VARCHAR(200) NOT NULL,
     unit_price    BIGINT       NOT NULL,
     quantity      INT          NOT NULL,
     options_json  CLOB,
     CONSTRAINT fk_cartitem_cart
     FOREIGN KEY (cart_id) REFERENCES CARTS(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cartitem_cart_id    ON CART_ITEMS(cart_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_product_id ON CART_ITEMS(product_id);
