// /js/cart.js

// ====== 공통 설정 ======
const API_BASE = '/api/cart';
const DEV_USER_ID =
    sessionStorage.getItem('USER_ID') ||
    localStorage.getItem('USER_ID') ||
    '1'; // 개발 기본값

function buildHeaders(extra = {}) {
    return {
        'X-USER-ID': DEV_USER_ID, // ✅ 핵심 헤더
        Accept: 'application/json',
        ...extra,
    };
}

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
    loadCart();
    const btn = document.getElementById('btn-checkout');
    if (btn) btn.addEventListener('click', goCheckout);

    const btnClear = document.getElementById('btn-clear');
    if (btnClear) btnClear.addEventListener('click', clearCart);

    console.debug('[cart] X-USER-ID =', DEV_USER_ID);
});

// ====== 장바구니 목록 조회 ======
async function loadCart() {
    try {
        const res = await api(`${API_BASE}/items`); // GET /api/cart/items
        const items = await res.json();

        const tbody = document.getElementById('cartTableBody');
        const emptyBox = document.getElementById('cart-empty');
        const totalEl = document.getElementById('cartTotal');

        tbody.innerHTML = '';

        if (!items || items.length === 0) {
            if (emptyBox) emptyBox.style.display = 'block';
            if (totalEl) totalEl.textContent = '0원';
            return;
        } else {
            if (emptyBox) emptyBox.style.display = 'none';
        }

        let total = 0;

        items.forEach(item => {
            const qty = Number(item.quantity || 1);
            const price = Number(item.price || 0);
            const subtotal = (typeof item.subtotal === 'number') ? item.subtotal : (price * qty);
            total += subtotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>
          <div class="fw-semibold">${item.name ?? '-'}</div>
          <div class="text-muted small">상품번호: ${item.productId ?? '-'}</div>
        </td>
        <td>${numberFormat(price)}원</td>
        <td>
          <div class="input-group input-group-sm" style="width: 120px;">
            <button class="btn btn-outline-secondary" type="button"
                    onclick="changeQty(${item.id}, ${Math.max(1, qty - 1)})">-</button>
            <input type="number" min="1" class="form-control text-center"
                   value="${qty}"
                   onchange="changeQty(${item.id}, this.value)">
            <button class="btn btn-outline-secondary" type="button"
                    onclick="changeQty(${item.id}, ${qty + 1})">+</button>
          </div>
        </td>
        <td>${numberFormat(subtotal)}원</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${item.id})">삭제</button>
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

// ====== 수량 변경 ======
let qtyBusy = new Set();
async function changeQty(cartItemId, newQty) {
    try {
        if (qtyBusy.has(cartItemId)) return;
        newQty = parseInt(newQty, 10);
        if (isNaN(newQty) || newQty < 1) return;

        qtyBusy.add(cartItemId);
        await api(`${API_BASE}/items/${cartItemId}`, {
            method: 'PUT', // PUT /api/cart/items/{id}
            body: JSON.stringify({ quantity: newQty })
        });
        await loadCart();
    } catch (e) {
        console.error(e);
        alert(e.message || '수량 변경에 실패했습니다.');
    } finally {
        qtyBusy.delete(cartItemId);
    }
}

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
