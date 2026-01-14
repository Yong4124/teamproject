let allProducts = []; // 전체 상품 목록 저장
let currentPage = 0;  // 현재 페이지
const pageSize = 7;  // 한 페이지당 표시할 상품 수
let pendingOrder = null;


document.addEventListener('DOMContentLoaded', function() {
    loadProductList();

    // 검색 버튼 클릭
    document.getElementById('searchBtn').addEventListener('click', function() {
        const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
        filterProducts(keyword);
    });

    // 엔터 입력 시 검색
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const keyword = e.target.value.trim().toLowerCase();
            filterProducts(keyword);
        }
    });

    document.getElementById('confirmOrderBtn').addEventListener('click', async () => {
        if (!pendingOrder) return;

        try {
            const response = await fetch(`/api/order_orderlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingOrder)
            });
            if (!response.ok) throw new Error('주문 요청 실패');
            alert('주문 완료! 발주 내역 페이지로 이동합니다.');
            window.location.href = '/order_orderlist';
        } catch (err) {
            console.error(err);
            alert('주문 중 오류 발생');
        }

        pendingOrder = null;
        bootstrap.Modal.getInstance(document.getElementById('confirmOrderModal'))?.hide();
    });
});


// ============================
// 🔹 상품 목록 조회
// ============================
async function loadProductList(page = 0) {
    try {
        const response = await fetch(`/api/order_products?page=${page}&size=${pageSize}`);
        if (!response.ok) throw new Error('상품 목록 불러오기 실패');

        const data = await response.json();
        allProducts = data.content; // 현재 페이지 상품만 저장
        currentPage = page;
        renderProducts(allProducts); // 테이블 렌더링
        renderPagination(data.totalPages, currentPage);
    } catch (error) {
        console.error('상품 목록 조회 오류:', error);
        alert('상품 목록을 불러오는데 실패했습니다.');
    }
}

// ============================
// 🔹 페이징 버튼 렌더링
// ============================
function renderPagination(totalPages, page) {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;

    paginationDiv.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i + 1;
        btn.className = i === page ? 'btn btn-coffee me-1' : 'btn btn-outline-coffee me-1';
        btn.onclick = () => loadProductList(i);
        paginationDiv.appendChild(btn);
    }
}


// 테이블 렌더링 함수
function renderProducts(products) {
    const tbody = document.getElementById('productListTableBody');
    tbody.innerHTML = ''; // 초기화

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.id}</td>
            <td style="display:flex; align-items:center; gap:10px;">
                <img src="${product.imageUrl}" alt="${product.name}" width="60" height="60">
                <a href="#" onclick="showProductDetail(${product.id})" style="text-decoration:none; color:#5C4033;">
                    ${product.name}
                </a>
            </td>
            <td>${product.price.toLocaleString()} 원</td>
            <td>
                <div class="input-group input-group-sm" style="width:300px;">
                    <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${product.id}, -1)">−</button>
                    <input type="text" id="qty-${product.id}" class="form-control text-center" value="1" readonly>
                    <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${product.id}, 1)">+</button>
                    <button class="btn btn-outline-coffee ms-2" onclick="addToCart(${product.id})">담기</button>
                    <button class="btn btn-coffee ms-2" onclick="orderNow(${product.id})">주문하기</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 🔸 모달 표시 + 주문 데이터 준비
function orderNow(productId) {
    const product = allProducts.find(p => p.id === productId);
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    // 주문 데이터 구조 (OrderRequest 형식)
    pendingOrder = {
        items: [
            {
                productId: product.id,
                productName: product.name,
                quantity: quantity,
                price: product.price
            }
        ]
    };

    // 모달 메시지 업데이트
    const msg = `"${product.name}"을(를) ${quantity}개 바로 주문하시겠습니까?`;
    document.getElementById('confirmOrderMessage').textContent = msg;

    // 모달 띄우기
    const modal = new bootstrap.Modal(document.getElementById('confirmOrderModal'));
    modal.show();
}



// 상세보기 모달 함수
function showProductDetail(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // 모달 내용 채우기
    document.getElementById('modalProductImage').src = product.imageUrl;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductSize').textContent = product.size || '-';
    document.getElementById('modalProductCalorie').textContent = product.calorie || '-';
    document.getElementById('modalProductDescription').textContent = product.description || '-';
    document.getElementById('modalProductAllergy').textContent = product.allergy || '-';
    document.getElementById('modalProductFat').textContent = product.fat || '-';
    document.getElementById('modalProductSugar').textContent = product.sugar || '-';
    document.getElementById('modalProductSodium').textContent = product.sodium || '-';
    document.getElementById('modalProductProtein').textContent = product.protein || '-';
    document.getElementById('modalProductCaffeine').textContent = product.caffeine || '-';

    // 모달 띄우기
    const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    modal.show();
}


// 🔹 검색 필터링 함수
async function filterProducts(keyword) {
    currentPage = 0; // 검색하면 항상 첫 페이지부터
    const url = keyword
        ? `/api/order_products?keyword=${encodeURIComponent(keyword)}&page=${currentPage}&size=${pageSize}`
        : `/api/order_products?page=${currentPage}&size=${pageSize}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('검색 실패');

        const data = await response.json();
        allProducts = data.content; // ✅ 검색 결과로 갱신
        renderProducts(allProducts); // ✅ 갱신된 데이터 렌더링
        renderPagination(data.totalPages, currentPage);
    } catch (error) {
        console.error('상품 검색 오류:', error);
    }
}



function changeQuantity(productId, delta) {
    const input = document.getElementById(`qty-${productId}`);
    let current = parseInt(input.value);
    current = isNaN(current) ? 1 : current + delta;
    if (current < 1) current = 1; // 최소 1개 유지
    input.value = current;
}


// ============================
// 🔹 장바구니 담기 (수량 포함)
// ============================
async function addToCart(productId) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    try {
        const response = await fetch(`/api/order_carts/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }) // ✅ 수량 전달
        });

        if (!response.ok) throw new Error('장바구니 담기 실패');
        alert('장바구니에 추가되었습니다.');
    } catch (error) {
        console.error('장바구니 담기 실패:', error);
        alert(error.message);
    }
}

