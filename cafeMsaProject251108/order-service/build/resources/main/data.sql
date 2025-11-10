-- ID 컬럼 제외하고 insert
INSERT INTO ORDERS (user_id, total_quantity, total_amount, status, created_at, updated_at)
VALUES
    (1, 5, 11500, 'NEW', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    (2, 2,  4000, 'NEW', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

INSERT INTO ORDER_ITEMS (order_id, product_id, product_name, unit_price, quantity) VALUES
    (1, 2, '아메리카노', 2000, 2),
    (1, 1, '아이스티',   2500, 3),
    (2, 2, '아메리카노', 2000, 2);
