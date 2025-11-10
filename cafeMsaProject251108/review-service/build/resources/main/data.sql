-- 샘플 리뷰 데이터 1: 상품 ID 101에 대한 긍정적인 리뷰
INSERT INTO REVIEWS (author, content, product_id, created_at) VALUES
    ('김개발', '정말 만족스러운 제품입니다. 배송도 빠르고 품질도 기대 이상이네요!', 1, NOW());

-- 샘플 리뷰 데이터 2: 상품 ID 202에 대한 보통 리뷰
INSERT INTO REVIEWS (author, content, product_id, created_at) VALUES
    ('박리뷰어', '가격 대비 성능은 괜찮지만, 마감이 조금 아쉽습니다. 다음 버전이 기대돼요.', 2, NOW());

-- 샘플 리뷰 데이터 3: 상품 ID 101에 대한 추가 리뷰
INSERT INTO REVIEWS (author, content, product_id, created_at) VALUES
    ('최테스터', '두 번째 구매입니다. 여전히 최고예요. 주변에도 추천하고 있습니다!', 3, NOW());