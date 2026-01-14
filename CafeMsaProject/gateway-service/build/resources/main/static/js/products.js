// ===== 전역 =====
let productModal;
let productDetailModal;      // ✅ 상세 모달
let currentRole = null;      // "ROLE_USER" / "ROLE_OWNER"
let currentUserId = null;    // 로그인 유저 ID (localStorage 에서 읽음)
let allProducts = [];        // 전체 상품 목록 캐시
let currentCategoryFilter = 'ALL'; // 'ALL' | '음료' | '푸드'

// ✅ 페이징 전역 변수 (1페이지부터 시작)
let currentPage = 1;         // 현재 페이지
const pageSize = 7;          // 한 페이지에 보여줄 상품 개수 (7개)

// 공통: role 정규화
function normalizeRole(role) {
    if (!role) return null;
    const r = String(role).toUpperCase();
    if (r.startsWith('ROLE_')) return r;
    if (r.includes('OWNER') || r.includes('ADMIN')) return 'ROLE_OWNER';
    if (r.includes('USER')) return 'ROLE_USER';
    return r;
}

// ===== 초기 진입 =====
document.addEventListener('DOMContentLoaded', async function () {
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    productDetailModal = new bootstrap.Modal(document.getElementById('productDetailModal'));

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const rawRole = localStorage.getItem('role');
    const rawUserId = localStorage.getItem('userId');

    // ✅ 수정: 비로그인 사용자도 상품 목록 조회 가능
    if (!token || !username) {
        // 비로그인 상태
        currentRole = null;
        currentUserId = null;
    } else {
        // 로그인 상태
        currentRole = normalizeRole(rawRole) || 'ROLE_USER';
        currentUserId = rawUserId ? Number(rawUserId) : 1;
    }

    renderNavBar();          // nav-menu 없으면 그냥 무시됨
    setupUIByRole();
    updateProductPageTitle();   // ✅ 역할에 따라 제목 텍스트만 변경
    updateFilterButtons();

    // 🔎 검색 입력 시 즉시 필터링
    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderProducts();
        });
    }

    await loadProducts();
});

// ===== 네비바 관련 =====
function renderNavBar() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;

    const activeClass = 'btn btn-nav-active';
    const normalClass = 'btn btn-nav-custom';
    const getClass = (path) => location.pathname.startsWith(path) ? activeClass : normalClass;

    if (currentRole === 'ROLE_OWNER') {
        navMenu.innerHTML = `
            <a href="/products" class="${getClass('/products')} me-2">상품목록</a>
            <a href="/order_products" class="${getClass('/orders/purchase')} me-2">발주</a>
            <a href="/order_orderlist" class="${getClass('/orders/purchase/history')} me-2">발주내역</a>
            <a href="/admin/users" class="${getClass('/admin/users')}">사용자 관리</a>
        `;
    } else if (currentRole === 'ROLE_USER') {
        navMenu.innerHTML = `
            <a href="/products" class="${getClass('/products')} me-2">상품목록</a>
            <a href="/cart" class="${getClass('/cart')} me-2">장바구니</a>
            <a href="/orders" class="${getClass('/orders')} me-2">상품내역</a>
            <a href="/favorites" class="${getClass('/favorites')}">즐겨찾기</a>
        `;
    } else {
        navMenu.innerHTML = `
            <a href="/products" class="${getClass('/products')} me-2">상품목록</a>
        `;
    }
}

function setupUIByRole() {
    const addBtn = document.getElementById('btn-add-product');
    const cartBtn = document.getElementById('btn-go-cart');
    const actionHeader = document.getElementById('th-action');

    if (currentRole === 'ROLE_OWNER') {
        if (addBtn) addBtn.style.display = 'inline-block';
        if (cartBtn) cartBtn.style.display = 'none';
        if (actionHeader) actionHeader.textContent = '작업';
    } else if (currentRole === 'ROLE_USER') {
        if (addBtn) addBtn.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'inline-block';
        if (actionHeader) actionHeader.textContent = '장바구니';
    } else {
        // ✅ 수정: 비로그인 - 버튼 모두 숨김
        if (addBtn) addBtn.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'none';
        if (actionHeader) actionHeader.textContent = '';
    }
}

// ✅ 역할에 따라 페이지 상단 제목 텍스트만 변경 (아이콘은 그대로 유지)
function updateProductPageTitle() {
    const titleSpan = document.getElementById('productPageTitleText');
    if (!titleSpan) return;

    if (currentRole === 'ROLE_OWNER') {
        titleSpan.textContent = '상품 관리';
    } else if (currentRole === 'ROLE_USER') {
        titleSpan.textContent = '상품목록';
    } else {
        titleSpan.textContent = '상품목록';
    }
}

// ===== 상품 조회 =====
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`상품 목록 조회 실패 (${response.status}) ${text}`);
        }

        const products = await response.json();
        allProducts = products || [];
        currentPage = 1;          // 처음 로딩 시 1페이지
        renderProducts();
    } catch (error) {
        console.error('상품 목록을 불러오는데 실패했습니다:', error);
        alert('상품 목록을 불러오는데 실패했습니다.');
    }
}

// ===== 상품 렌더링 =====
function renderProducts() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const fmt = (n) => {
        const v = Number(n || 0);
        try { return v.toLocaleString(); } catch { return String(v); }
    };

    // 🔎 검색어 읽기 (없으면 공백)
    const searchInput = document.getElementById('productSearchInput');
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // ✅ 카테고리 + 검색 필터 같이 적용
    const filtered = allProducts.filter(product => {
        // 카테고리 필터
        if (currentCategoryFilter !== 'ALL' && product.category !== currentCategoryFilter) {
            return false;
        }

        // 검색어 필터 (상품명 기준)
        if (keyword) {
            const name = String(product.name || '').toLowerCase();
            if (!name.includes(keyword)) {
                return false;
            }
        }
        return true;
    });

    // ✅ 페이징 계산
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageItems = filtered.slice(startIdx, endIdx);

    // ✅ 페이징 버튼 렌더링
    renderPagination(totalPages, currentPage);

    pageItems.forEach(product => {
        const tr = document.createElement('tr');

        const isSoldOut = !product.stock || product.stock <= 0;
        const imgSrc = product.imageUrl || product.image_url || '';
        const safeName = String(product.name ?? '').replace(/"/g, '&quot;');

        // 🔸 카테고리 pill 스타일 class 결정
        const category = product.category || '-';
        let categoryClass = '';
        let categoryIcon = 'bi-tag';

        if (category === '음료') {
            categoryClass = 'drink';
            categoryIcon = 'bi-cup-straw';
        } else if (category === '푸드') {
            categoryClass = 'food';
            categoryIcon = 'bi-egg-fried';
        }

        // 🔸 품절 뱃지 class/문구
        const inStock = !isSoldOut;
        const stockClass = inStock ? 'in-stock' : 'sold-out';
        const stockIcon = inStock ? 'bi-check-circle' : 'bi-x-circle';
        const stockText = inStock ? '판매중' : '품절';

        // 🔸 역할에 따라 작업 버튼 구성
        let actionButtons = '';

        if (currentRole === 'ROLE_OWNER') {
            actionButtons = `
                <button class="btn btn-sm btn-primary me-1 action-btn" onclick="editProduct(${product.id})">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-danger action-btn" onclick="deleteProduct(${product.id})">
                    <i class="bi bi-trash"></i>
                </button>
            `;
        } else if (currentRole === 'ROLE_USER') {
            if (inStock) {
                const pname  = String(product.name ?? '').replace(/'/g, "\\'");
                const pcat   = String(product.category ?? '').replace(/'/g, "\\'");
                const pprice = Number(product.price ?? 0);

                actionButtons = `
                    <button class="btn btn-sm btn-outline-coffee me-1 action-btn"
                            onclick="addToCart(${product.id})">
                        <i class="bi bi-bag-check me-1"></i>담기
                    </button>
                    <button class="btn btn-sm btn-outline-danger action-btn"
                            style="border-color:#dc3545;color:#dc3545;"
                            onclick="addToFavorites(${product.id}, '${pname}', '${pcat}', ${pprice})">
                        ♡ 즐겨찾기
                    </button>
                `;
            } else {
                actionButtons = `
                    <button class="btn btn-sm btn-secondary action-btn" disabled>
                        품절
                    </button>`;
            }
        }
        // ✅ 수정: 비로그인 사용자(currentRole === null)는 actionButtons가 빈 문자열로 유지됨 (버튼 없음)

        tr.innerHTML = `
            <td>${product.id}</td>
            <td>
                <div class="d-flex align-items-center" style="gap:10px;">
                    <img src="${imgSrc}"
                         alt="${safeName}"
                         class="rounded"
                         style="width:50px;height:50px;object-fit:cover;">
                    <a href="javascript:void(0)" 
                       onclick="showProductDetail(${product.id})">
                        ${product.name}
                    </a>
                </div>
            </td>
            <td>${fmt(product.price)}원</td>
            <td>
                <span class="category-pill ${categoryClass}">
                    <i class="bi ${categoryIcon}"></i>
                    ${category}
                </span>
            </td>
            <td>
                <span class="stock-badge ${stockClass}">
                    <i class="bi ${stockIcon}"></i>
                    ${stockText}
                </span>
            </td>
            <td>${actionButtons}</td>
        `;

        tbody.appendChild(tr);
    });
}

// ===== 페이징 =====
function goToPage(page) {
    currentPage = page;
    renderProducts();
}

function renderPagination(totalPages, page) {
    const paginationContainer = document.getElementById('productPagination');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    // 페이지가 1개면 페이징 버튼 숨김
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = i;

        // 주문페이지와 동일하게: 현재 페이지는 진한 커피색, 나머지는 흰 배경 + 테두리
        btn.className = (i === page)
            ? 'btn btn-coffee me-2'
            : 'btn btn-outline-coffee me-2';

        btn.onclick = () => {
            if (i !== currentPage) {
                goToPage(i);
            }
        };
        paginationContainer.appendChild(btn);
    }
}

// ===== 카테고리 버튼 =====
function setCategoryFilter(filter) {
    currentCategoryFilter = filter;
    currentPage = 1;     // ✅ 카테고리 변경 시 1페이지로
    updateFilterButtons();
    renderProducts();
}

function updateFilterButtons() {
    const btnAll   = document.getElementById('btn-filter-all');
    const btnDrink = document.getElementById('btn-filter-drink');
    const btnFood  = document.getElementById('btn-filter-food');

    const buttons = [btnAll, btnDrink, btnFood];
    buttons.forEach(btn => {
        if (!btn) return;
        btn.classList.remove('btn-coffee', 'text-white');
        btn.classList.add('btn-outline-coffee');
    });

    let activeBtn = null;
    if (currentCategoryFilter === 'ALL') activeBtn = btnAll;
    if (currentCategoryFilter === '음료') activeBtn = btnDrink;
    if (currentCategoryFilter === '푸드') activeBtn = btnFood;

    if (activeBtn) {
        activeBtn.classList.remove('btn-outline-coffee');
        activeBtn.classList.add('btn-coffee', 'text-white');
    }
}

// ===== 상품 추가 모달 =====
function showAddProductModal() {
    if (currentRole !== 'ROLE_OWNER') {
        alert('상품 추가는 사장 계정만 가능합니다.');
        return;
    }

    document.getElementById('modalTitle').textContent = '상품 추가';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productStock').value = '1';
    document.getElementById('productCategory').value = '음료';

    // 새로 추가된 필드들 초기화
    document.getElementById('productImageUrl').value = '';
    document.getElementById('productCalorie').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productAllergy').value = '';
    document.getElementById('productFat').value = '';
    document.getElementById('productSugar').value = '';
    document.getElementById('productSodium').value = '';
    document.getElementById('productProtein').value = '';
    document.getElementById('productCaffeine').value = '';

    productModal.show();
}

// ===== 상품 수정 모달 =====
async function editProduct(id) {
    if (currentRole !== 'ROLE_OWNER') {
        alert('상품 수정은 사장 계정만 가능합니다.');
        return;
    }

    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error("상품 조회 실패");

        const product = await response.json();

        document.getElementById('modalTitle').textContent = '상품 수정';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productStock').value = product.stock > 0 ? '1' : '0';
        document.getElementById('productCategory').value = product.category || '음료';

        // 새로 추가된 필드들
        document.getElementById('productImageUrl').value = product.imageUrl || product.image_url || '';
        document.getElementById('productCalorie').value = product.calorie || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productAllergy').value = product.allergy || '';
        document.getElementById('productFat').value = product.fat || '';
        document.getElementById('productSugar').value = product.sugar || '';
        document.getElementById('productSodium').value = product.sodium || '';
        document.getElementById('productProtein').value = product.protein || '';
        document.getElementById('productCaffeine').value = product.caffeine || '';

        productModal.show();
    } catch (e) {
        alert('상품 정보를 불러오지 못했습니다.');
    }
}

// ===== 상품 저장 =====
async function saveProduct() {
    if (currentRole !== 'ROLE_OWNER') {
        alert('상품 저장은 사장 계정만 가능합니다.');
        return;
    }

    const id = document.getElementById('productId').value;
    const product = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        category: document.getElementById('productCategory').value,
        // 새로 추가된 필드들
        imageUrl: document.getElementById('productImageUrl').value || null,
        calorie: document.getElementById('productCalorie').value || null,
        description: document.getElementById('productDescription').value || null,
        allergy: document.getElementById('productAllergy').value || null,
        fat: document.getElementById('productFat').value || null,
        sugar: document.getElementById('productSugar').value || null,
        sodium: document.getElementById('productSodium').value || null,
        protein: document.getElementById('productProtein').value || null,
        caffeine: document.getElementById('productCaffeine').value || null
    };

    try {
        const response = await fetch(id ? `/api/products/${id}` : '/api/products', {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (!response.ok) throw new Error('저장 실패');

        productModal.hide();
        await loadProducts();
        alert('저장되었습니다.');
    } catch (e) {
        alert('저장에 실패했습니다.');
    }
}

async function deleteProduct(id) {
    if (currentRole !== 'ROLE_OWNER') {
        alert('상품 삭제는 사장 계정만 가능합니다.');
        return;
    }

    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error();

        await loadProducts();
        alert('삭제되었습니다.');
    } catch {
        alert('삭제에 실패했습니다.');
    }
}

// ===== 상품 상세 보기 =====
function showProductDetail(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) {
        alert('상품 정보를 찾을 수 없습니다.');
        return;
    }

    const safe = (v) => (v === null || v === undefined || v === '' ? '-' : v);

    const img = document.getElementById('detailImage');
    if (img) {
        img.src = product.imageUrl || product.image_url || '';
    }

    document.getElementById('detailName').textContent        = safe(product.name);
    document.getElementById('detailSize').textContent        = safe(product.size);
    document.getElementById('detailCalorie').textContent     = safe(product.calorie);
    document.getElementById('detailDescription').textContent = safe(product.description);
    document.getElementById('detailAllergy').textContent     = safe(product.allergy);

    document.getElementById('detailFat').textContent      = safe(product.fat);
    document.getElementById('detailSugar').textContent    = safe(product.sugar);
    document.getElementById('detailSodium').textContent   = safe(product.sodium);
    document.getElementById('detailProtein').textContent  = safe(product.protein);
    document.getElementById('detailCaffeine').textContent = safe(product.caffeine);

    productDetailModal.show();
}

// ===== 장바구니 / 즐겨찾기 =====
async function addToCart(productId) {
    if (currentRole !== 'ROLE_USER') {
        alert('장바구니 기능은 일반 사용자 계정에서만 사용할 수 있습니다.');
        return;
    }

    try {
        const userId = currentUserId ?? 1; // 임시 fallback

        const response = await fetch('/api/cart/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-USER-ID': String(userId)   // Cart 서비스용
            },
            body: JSON.stringify({
                productId,
                quantity: 1
            })
        });

        if (!response.ok) throw new Error('장바구니 담기 실패');
        alert('장바구니에 추가되었습니다.');
        // location.href = '/cart';

    } catch (error) {
        console.error('장바구니 담기에 실패했습니다:', error);
        alert('장바구니 담기에 실패했습니다.');
    }
}

async function addToFavorites(productId, productName, category, price) {
    if (currentRole !== 'ROLE_USER') {
        alert('즐겨찾기 기능은 일반 사용자 계정만 가능합니다.');
        return;
    }

    try {
        const userId = currentUserId ?? 1;

        const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': String(userId)   // ✅ 필수 헤더 추가
            },
            body: JSON.stringify({
                // userId 는 굳이 안 보내도 됨 (서버에서 setUserId 해줌)
                productId,
                productName,
                category,
                price
            })
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`즐겨찾기 추가 실패 (${response.status}) ${text}`);
        }

        alert('즐겨찾기에 추가되었습니다.');
    } catch (e) {
        console.error(e);
        alert('즐겨찾기 추가 실패!');
    }
}