-- 필요시만 사용. 스키마와 같은 리소스 경로에 둡니다.
-- CARTS 먼저
INSERT INTO CARTS (id, user_id, status, total_quantity, total_amount, created_at, updated_at)
VALUES (1, 1, 'OPEN', 3, 6500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CART_ITEMS (주의: unit_price 컬럼명)
INSERT INTO CART_ITEMS (cart_id, product_id, product_name, unit_price, quantity) VALUES
                                                                                     (1, 2, '아메리카노', 2000, 2),
                                                                                     (1, 1, '아이스티',   2500, 1);