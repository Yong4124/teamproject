-- 원두
INSERT INTO ORDER_PRODUCT (name, price, size, calorie, description, allergy, fat, sugar, sodium, protein, caffeine, image_url)
VALUES
    ('아라비카 원두 1kg', 45000, '1kg', '-', '부드러운 산미와 향이 특징인 아라비카 원두', '-', '-', '-', '-', '-', '카페인 포함',
     'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80'),
    ('로부스타 원두 1kg', 30000, '1kg', '-', '진한 맛과 높은 카페인 함량의 로부스타 원두', '-', '-', '-', '-', '-', '카페인 포함',
     'https://plus.unsplash.com/premium_photo-1675435644687-562e8042b9db?q=80&w=449&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('콜롬비아 원두 1kg', 48000, '1kg', '-', '부드럽고 균형 잡힌 맛의 콜롬비아 원두', '-', '-', '-', '-', '-', '카페인 포함',
     'https://images.unsplash.com/photo-1692296113053-76f240e5ce33?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('에티오피아 원두 1kg', 50000, '1kg', '-', '과일 향과 산미가 뛰어난 에티오피아 원두', '-', '-', '-', '-', '-', '카페인 포함',
     'https://plus.unsplash.com/premium_photo-1677661620514-aec974a9876c?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

-- 우유/크림/대체우유
INSERT INTO ORDER_PRODUCT (name, price, size, calorie, description, allergy, fat, sugar, sodium, protein, caffeine, image_url)
VALUES
    ('우유 1L', 2500, '1L', '640kcal', '일반 우유 1리터', '우유', '10g', '12g', '120mg', '32g', '0',
     'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('휘핑크림 500ml', 6000, '500ml', '1750kcal', '커피 및 디저트용 휘핑크림', '우유', '90g', '20g', '250mg', '5g', '0',
     'https://images.unsplash.com/photo-1622737338437-39a24c37f0de?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('아몬드 밀크 1L', 3500, '1L', '500kcal', '식물성 아몬드 밀크, 라떼용 대체 우유', '-', '3g', '7g', '120mg', '2g', '0',
     'https://plus.unsplash.com/premium_photo-1695042865374-29b4e12dd506?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('코코넛 크림 500ml', 7000, '500ml', '800kcal', '커피 및 디저트용 코코넛 크림', '-', '50g', '5g', '10mg', '1g', '0',
     'https://plus.unsplash.com/premium_photo-1676225679944-b5ec6ad07739?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

-- 시럽/소스
INSERT INTO ORDER_PRODUCT (name, price, size, calorie, description, allergy, fat, sugar, sodium, protein, caffeine, image_url)
VALUES
    ('바닐라 시럽 500ml', 8000, '500ml', '1000kcal', '바닐라 향 시럽, 커피 및 음료 첨가용', '-', '0g', '250g', '0mg', '0g', '0',
     'https://images.unsplash.com/photo-1650406378384-c7445e8ae6af?q=80&w=327&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('카라멜 소스 500ml', 9000, '500ml', '1500kcal', '카라멜 풍미 소스, 음료 및 디저트용', '-', '0g', '300g', '0mg', '0g', '0',
     'https://plus.unsplash.com/premium_photo-1695397434404-0de13c8b561a?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('헤이즐넛 시럽 500ml', 8500, '500ml', '1100kcal', '헤이즐넛 향 시럽, 음료 첨가용', '-', '0g', '260g', '0mg', '0g', '0',
     'https://images.unsplash.com/photo-1605713158888-5e30f5bb9f17?q=80&w=873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('모카 시럽 500ml', 8500, '500ml', '1100kcal', '초콜릿 풍미 시럽, 음료용', '-', '0g', '270g', '0mg', '0g', '0',
     'https://images.unsplash.com/photo-1541782064729-b752e929ebbc?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('아몬드 시럽 500ml', 9000, '500ml', '1200kcal', '라떼 및 음료용 아몬드 시럽', '-', '0g', '280g', '0mg', '0g', '0',
     'https://images.unsplash.com/photo-1583687463124-ff2aa00b1160?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

-- 기타 재료/토핑
INSERT INTO ORDER_PRODUCT (name, price, size, calorie, description, allergy, fat, sugar, sodium, protein, caffeine, image_url)
VALUES
    ('설탕 1kg', 2000, '1kg', '4000kcal', '백설탕 1kg', '-', '0g', '1000g', '0mg', '0g', '0',
     'https://plus.unsplash.com/premium_photo-1661266890061-ef7caab08054?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('코코아 파우더 250g', 7000, '250g', '1000kcal', '무가당 코코아 파우더', '-', '10g', '0g', '5mg', '20g', '0',
     'https://plus.unsplash.com/premium_photo-1666174326095-37c94a3e93f4?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('얼음 큐브 1kg', 1500, '1kg', '0kcal', '커피 및 음료용 얼음 큐브', '-', '0g', '0g', '0mg', '0g', '0',
     'https://images.unsplash.com/photo-1590430752967-d0e116909be1?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('코코아 가루 100g', 5000, '100g', '400kcal', '디저트 및 라떼용 코코아 가루', '-', '8g', '0g', '2mg', '10g', '0',
     'https://images.unsplash.com/photo-1589985270958-af9812c8ddb5?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('시나몬 가루 50g', 4000, '50g', '150kcal', '음료 및 디저트 토핑용 시나몬 가루', '-', '0g', '0g', '0mg', '0g', '0',
     'https://images.unsplash.com/photo-1611256243212-48a03787ea01?q=80&w=877&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('초코칩 200g', 6000, '200g', '1000kcal', '커피 및 디저트용 초코칩', '-', '25g', '500g', '5mg', '8g', '0',
     'https://plus.unsplash.com/premium_photo-1726072358526-542e07d58e36?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

-- 컵/용품 (참고용, 그대로 유지)
INSERT INTO ORDER_PRODUCT (name, price, size, calorie, description, allergy, fat, sugar, sodium, protein, caffeine, image_url)
VALUES
    ('종이컵 250ml 100개', 12000, '250ml x 100개', '-', '일회용 종이컵', '-', '-', '-', '-', '-', '0',
     'https://plus.unsplash.com/premium_photo-1664970900294-c865d871a9cf?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('플라스틱컵 500ml 50개', 8000, '500ml x 50개', '-', '냉음료용 플라스틱 컵', '-', '-', '-', '-', '-', '0',
     'https://plus.unsplash.com/premium_photo-1664191866328-abf466c9702a?q=80&w=386&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
    ('스테인리스 스푼 10개', 12000, '10개', '-', '커피용 스테인리스 스푼', '-', '-', '-', '-', '-', '0',
     'https://images.unsplash.com/photo-1662132054669-81b53a80d0aa?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
