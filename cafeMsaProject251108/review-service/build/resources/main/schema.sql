-- REVIEWS 테이블 생성
CREATE TABLE IF NOT EXISTS REVIEWS (
    -- 기본 키 (id)
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- 작성자 (author): @Column(nullable = false)에 따라 NOT NULL 설정
     author VARCHAR(255) NOT NULL,

    -- 리뷰 내용 (content): @Column(nullable = false, length = 1000)에 따라 NOT NULL 및 최대 길이 설정
    content VARCHAR(1000) NOT NULL,

    -- 상품 ID (productId): @Column(nullable = false)에 따라 NOT NULL 설정
    product_id BIGINT NOT NULL,

    -- 작성일 (createdAt): @Column(nullable = false)에 따라 NOT NULL 설정
    created_at TIMESTAMP NOT NULL
    );