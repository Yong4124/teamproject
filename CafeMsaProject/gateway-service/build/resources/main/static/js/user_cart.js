// ====== 공통 설정 ======
const API_BASE = '/api/cart';

// 로그인 된 유저 ID
let CURRENT_USER_ID = null;

// 장바구니 캐시 (필수는 아니지만 남겨둠)
let cartItems = [];

// 공통 헤더 생성 함수
function buildHeaders(extra = {}) {
    if (!CURRENT_USER_ID) {
        alert('로그인이 필요합니다.');
        location.href = '/login';
        throw new Error('로그인 필요');
    }

    return {
        'X-USER-ID': CURRENT_USER_ID,
        'Accept': 'application/json',
        ...extra,
    };
}

// 공통 fetch 래퍼
async function api(path, opt = {}) {
    const isJsonBody = typeof opt.body === 'string';
    const defaultHeaders = isJsonBody ? { 'Content-Type': 'application/json' } : {};
    const headers = { ...defaultHeaders, ...buildHeaders(opt.headers || {}) };

    const res = await fetch(path, { ...opt, headers });

    if (!res.ok) {
        let msg = `요청 실패 (${res.status})`;
        try {
            const data = await res.json();
            if (data?.message) msg = data.message;
        } catch (_) {}
        if (res.status === 401) msg = '로그인이 필요합니다.';
        if (res.status === 403) msg = '권한이 없습니다.';
        if (res.status === 422) msg = '요청 데이터가 올바르지 않습니다.';
        throw new Error(msg);
    }
    return res;
}

function numberFormat(n) {
    try { return (n ?? 0).toLocaleString(); } catch { return n; }
}

// ====== 초기 바인딩 ======
document.addEventListener('DOMContentLoaded', () => {
    const token    = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
        alert('로그인이 필요합니다.');
        location.href = '/login';
        return;
    }

    const userIdFromNew   = localStorage.getItem('userId');
    const userIdFromLocal = localStorage.getItem('USER_ID');
    const userIdFromSess  = sessionStorage.getItem('USER_ID');

    CURRENT_USER_ID = String(
        userIdFromNew ||
        userIdFromLocal ||
        userIdFromSess ||
        '1'
    );

    console.debug('[cart] X-USER-ID =', CURRENT_USER_ID);

    // 장바구니 로딩
    loadCart();

    // 버튼 이벤트
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) btnCheckout.addEventListener('click', goCheckout);

    const btnClear = document.getElementById('btn-clear');
    if (btnClear) btnClear.addEventListener('click', clearCart);
});

// ====== 장바구니 목록 조회 ======
async function loadCart() {
    try {
        const res = await api(`${API_BASE}/items`); // GET /api/cart/items
        const items = await res.json();

        // 캐시에 저장
        cartItems = items || [];

        const tbody     = document.getElementById('cartTableBody');
        const emptyBox  = document.getElementById('cart-empty');
        const totalEl   = document.getElementById('cartTotal');
        const tableCard = document.getElementById('cartTableCard');

        tbody.innerHTML = '';

        // 비었을 때 처리
        if (!cartItems.length) {
            if (emptyBox)  emptyBox.classList.remove('d-none');
            if (tableCard) tableCard.classList.add('d-none');
            if (totalEl)   totalEl.textContent = '0원';
            return;
        } else {
            if (emptyBox)  emptyBox.classList.add('d-none');
            if (tableCard) tableCard.classList.remove('d-none');
        }

        let total = 0;

        cartItems.forEach(item => {
            const qty      = Number(item.quantity || 1);
            const price    = Number(item.price || 0);
            const subtotal = (typeof item.subtotal === 'number')
                ? item.subtotal
                : (price * qty);

            total += subtotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="fw-semibold">${item.name ?? '-'}</div>
                    <div class="text-muted small">상품번호: ${item.productId ?? '-'}</div>
                </td>
                <td>${numberFormat(price)}원</td>
                
                <!-- ✅ 수량: - 1 + 형태 -->
                <td>
                    <div class="qty-pill" data-id="${item.id}">
                        <button type="button" class="qty-btn" data-action="minus">−</button>
                        <span class="qty-value">${qty}</span>
                        <button type="button" class="qty-btn" data-action="plus">+</button>
                    </div>
                </td>

                <td>${numberFormat(subtotal)}원</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="removeItem(${item.id})">삭제</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (totalEl) totalEl.textContent = `${numberFormat(total)}원`;
    } catch (e) {
        console.error(e);
        alert(e.message || '장바구니를 불러오지 못했습니다.');
    }
}

// ====== 수량 변경 (+/- 버튼) ======
// 문서 전체에서 qty-btn 클릭을 감지
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;

    const wrap = btn.closest('.qty-pill');
    if (!wrap) return;

    const id = wrap.dataset.id;
    if (!id) return;

    const valueEl = wrap.querySelector('.qty-value');
    let qty = parseInt(valueEl.textContent, 10) || 1;

    if (btn.dataset.action === 'minus') {
        if (qty <= 1) return; // 1 이하로는 감소 X
        qty--;
    } else if (btn.dataset.action === 'plus') {
        qty++;
    }

    try {
        await api(`${API_BASE}/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: qty })
        });

        // 서버 반영 후 다시 로딩해서 합계/소계 갱신
        await loadCart();
    } catch (e2) {
        console.error(e2);
        alert(e2.message || '수량 변경에 실패했습니다.');
    }
});

// ====== 항목 삭제 ======
async function removeItem(cartItemId) {
    if (!confirm('이 상품을 장바구니에서 삭제할까요?')) return;
    try {
        await api(`${API_BASE}/items/${cartItemId}`, { method: 'DELETE' }); // DELETE /api/cart/items/{id}
        await loadCart();
    } catch (e) {
        console.error(e);
        alert(e.message || '삭제에 실패했습니다.');
    }
}

// ====== 결제/주문 이동 ======
function goCheckout() {
    location.href = '/orders/checkout';
}

// ====== 장바구니 전체 비우기 ======
async function clearCart() {
    if (!confirm('장바구니의 모든 상품을 삭제할까요?')) return;
    try {
        await api(`${API_BASE}/clear`, { method: 'DELETE' }); // DELETE /api/cart/clear
        await loadCart();
    } catch (e) {
        console.error(e);
        alert(e.message || '장바구니 비우기에 실패했습니다.');
    }
}
