// ===== 전역 =====
let productModal;
let currentRole = null;      // "ROLE_USER" / "ROLE_OWNER"
let currentUserId = null;    // 로그인 유저 ID (localStorage 에서 읽음)
let allProducts = [];        // 전체 상품 목록 캐시
let currentCategoryFilter = 'ALL'; // 'ALL' | '음료' | '푸드'

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

    // 1) 로그인 상태 / 역할 / userId 를 localStorage 에서 읽기
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const rawRole = localStorage.getItem('role');
    const rawUserId = localStorage.getItem('userId'); // 없으면 null

    // 로그인 안 돼 있으면 로그인 페이지로 보냄
    if (!token || !username) {
        alert('로그인이 필요합니다.');
        location.href = '/login';
        return;
    }

    currentRole = normalizeRole(rawRole) || 'ROLE_USER';
    currentUserId = rawUserId ? Number(rawUserId) : 1; // 임시: 없으면 1번(테스트용)

    // 2) 역할에 따라 네비바 & 버튼 세팅
    renderNavBar();
    setupUIByRole();

    // 3) 기본 필터 버튼 상태 설정
    updateFilterButtons();

    // 4) 상품 목록 조회 + 렌더링
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
        // 👔 사장 네비바
        navMenu.innerHTML = `
            <a href="/products" class="${getClass('/products')} me-2">상품목록</a>
            <a href="/order_products" class="${getClass('/orders/purchase')} me-2">발주</a>
            <a href="/order_orderlist" class="${getClass('/orders/purchase/history')} me-2">발주내역</a>
            <a href="/admin/users" class="${getClass('/admin/users')}">사용자 관리</a>
        `;
    } else if (currentRole === 'ROLE_USER') {
        // 👤 일반 사용자 네비바
        navMenu.innerHTML = `
            <a href="/products" class="${getClass('/products')} me-2">상품목록</a>
            <a href="/cart" class="${getClass('/cart')} me-2">장바구니</a>
            <a href="/orders" class="${getClass('/orders')} me-2">상품내역</a>
            <a href="/favorites" class="${getClass('/favorites')}">즐겨찾기</a>
        `;
    } else {
        // 비로그인 or 기타 역할
        navMenu.innerHTML = `
            <a href="/products" class="${getClass('/products')} me-2">상품목록</a>
        `;
    }
}

function setupUIByRole() {
    const addBtn = document.getElementById('btn-add-product');
    const actionHeader = document.getElementById('th-action');

    if (currentRole === 'ROLE_OWNER') {
        if (addBtn) addBtn.style.display = 'inline-block';
        if (actionHeader) actionHeader.textContent = '작업';
    } else if (currentRole === 'ROLE_USER') {
        if (addBtn) addBtn.style.display = 'none';
        if (actionHeader) actionHeader.textContent = '장바구니';
    } else {
        if (addBtn) addBtn.style.display = 'none';
        if (actionHeader) actionHeader.textContent = '';
    }
}

// ===== 상품 조회 및 렌더링 =====
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`상품 목록 조회 실패 (${response.status}) ${text}`);
        }

        const products = await response.json();
        allProducts = products || [];
        renderProducts();
    } catch (error) {
        console.error('상품 목록을 불러오는데 실패했습니다:', error);
        alert('상품 목록을 불러오는데 실패했습니다.');
    }
}

function renderProducts() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const fmt = (n) => {
        const v = Number(n || 0);
        try { return v.toLocaleString(); } catch { return String(v); }
    };

    const filtered = allProducts.filter(product => {
        if (currentCategoryFilter === 'ALL') return true;
        return product.category === currentCategoryFilter;
    });

    filtered.forEach(product => {
        const tr = document.createElement('tr');

        const isSoldOut = !product.stock || product.stock <= 0;
        const soldOutText = isSoldOut ? '품절' : '판매중';

        let actionButtons = '';

        if (currentRole === 'ROLE_OWNER') {
            // 👔 사장: 수정/삭제
            actionButtons = `
                <button class="btn btn-sm btn-primary me-1" onclick="editProduct(${product.id})">수정</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">삭제</button>
            `;
        } else if (currentRole === 'ROLE_USER') {
            // 👤 사용자: 장바구니 + 즐겨찾기 (품절이면 비활성화)

            if (!isSoldOut) {
                // ★ 여기만 수정: HTML attribute 안에서 안전하게 쓰도록
                const pname  = String(product.name ?? '').replace(/'/g, "\\'");
                const pcat   = String(product.category ?? '').replace(/'/g, "\\'");
                const pprice = Number(product.price ?? 0);

                actionButtons = `
                    <button class="btn btn-sm btn-success me-1"
                            onclick="addToCart(${product.id})">장바구니 담기</button>
                    <button class="btn btn-sm btn-outline-warning"
                            onclick="addToFavorites(${product.id}, '${pname}', '${pcat}', ${pprice})">★ 즐겨찾기</button>
                `;
            } else {
                actionButtons = `
                    <button class="btn btn-sm btn-secondary" disabled>품절</button>
                `;
            }
        }

        tr.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${fmt(product.price)}원</td>
            <td>${product.category || '-'}</td>
            <td>${soldOutText}</td>
            <td>${actionButtons}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ===== 카테고리 필터 =====
function setCategoryFilter(filter) {
    currentCategoryFilter = filter;
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
    if (currentCategoryFilter === 'ALL')   activeBtn = btnAll;
    if (currentCategoryFilter === '음료')   activeBtn = btnDrink;
    if (currentCategoryFilter === '푸드')   activeBtn = btnFood;

    if (activeBtn) {
        activeBtn.classList.remove('btn-outline-coffee');
        activeBtn.classList.add('btn-coffee', 'text-white');
    }
}

// ===== 상품 추가/수정/삭제 (사장 전용) =====
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

    productModal.show();
}

async function editProduct(id) {
    if (currentRole !== 'ROLE_OWNER') {
        alert('상품 수정은 사장 계정만 가능합니다.');
        return;
    }

    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`상품 조회 실패 (${response.status}) ${text}`);
        }

        const product = await response.json();

        document.getElementById('modalTitle').textContent = '상품 수정';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock > 0 ? '1' : '0';
        document.getElementById('productCategory').value = product.category || '음료';

        productModal.show();
    } catch (error) {
        console.error('상품 정보를 불러오는데 실패했습니다:', error);
        alert('상품 정보를 불러오는데 실패했습니다.');
    }
}

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
        category: document.getElementById('productCategory').value
    };

    try {
        const url = id ? `/api/products/${id}` : '/api/products';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`저장에 실패했습니다. (${response.status}) ${text}`);
        }

        productModal.hide();
        await loadProducts();
        alert('저장되었습니다.');
    } catch (error) {
        console.error('저장에 실패했습니다:', error);
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

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`삭제에 실패했습니다. (${response.status}) ${text}`);
        }

        await loadProducts();
        alert('삭제되었습니다.');
    } catch (error) {
        console.error('삭제에 실패했습니다:', error);
        alert('삭제에 실패했습니다.');
    }
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

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`장바구니 담기에 실패했습니다. (${response.status}) ${text}`);
        }

        location.href = '/cart';
    } catch (error) {
        console.error('장바구니 담기에 실패했습니다:', error);
        alert('장바구니 담기에 실패했습니다.');
    }
}

async function addToFavorites(productId, productName, category, price) {
    if (currentRole !== 'ROLE_USER') {
        alert('즐겨찾기 기능은 일반 사용자 계정에서만 사용할 수 있습니다.');
        return;
    }

    try {
        const userId = currentUserId ?? 1; // 임시 fallback (로그인 userId 저장 전까지)

        const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: Number(userId),
                productId: Number(productId),
                productName: productName ?? '',
                category: category ?? '',
                price: Number(price ?? 0)
            })
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`즐겨찾기 추가에 실패했습니다. (${response.status}) ${text}`);
        }

        alert('즐겨찾기에 추가되었습니다.');
    } catch (error) {
        console.error('즐겨찾기 추가에 실패했습니다:', error);
        alert('즐겨찾기 추가에 실패했습니다.');
    }
}