const UID = sessionStorage.getItem('USER_ID') || localStorage.getItem('USER_ID') || '1';
function h(extra) {
    return Object.assign({'X-USER-ID': UID, 'Accept': 'application/json'}, extra || {});
}
async function api(url, opt) {
    const res = await fetch(url, Object.assign({headers: h()}, opt || {}));
    if (!res.ok) throw new Error(await res.text());
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
}

let cacheItems = [];

async function loadCart() {
    const items = await api('/api/cart/items');
    cacheItems = items || [];

    const tbody = document.getElementById('tbody');
    const sumEl = document.getElementById('sum');
    const empty = document.getElementById('empty');

    tbody.innerHTML = '';
    if (!cacheItems.length) {
        empty.style.display = '';
        sumEl.textContent = '0원';
        return;
    }
    empty.style.display = 'none';

    let total = 0;
    for (const it of cacheItems) {
        const sub = (it.price || it.unitPrice || 0) * (it.quantity || 0);
        total += sub;
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${it.name || it.productName}</td>
      <td>${(it.price || it.unitPrice || 0).toLocaleString()}원</td>
      <td>${it.quantity}</td>
      <td>${sub.toLocaleString()}원</td>
    `;
        tbody.appendChild(tr);
    }
    sumEl.textContent = `${total.toLocaleString()}원`;
}

async function confirmOrder() {
    if (!cacheItems.length) { alert('장바구니가 비어 있습니다.'); return; }

    // cart-service 응답 필드 이름에 맞춰 매핑
    const body = cacheItems.map(it => ({
        productId: it.productId,
        name: it.name || it.productName,
        price: it.price || it.unitPrice,
        quantity: it.quantity
    }));

    // 주문 생성
    const order = await api('/api/orders', {
        method: 'POST',
        headers: h({'Content-Type': 'application/json'}),
        body: JSON.stringify(body)
    });

    // 장바구니 비우기
    try { await api('/api/cart/clear', { method: 'DELETE' }); } catch {}

    // 주문 상세로 이동
    location.href = `/orders/${order.id}`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart().catch(console.error);
    document.getElementById('btn-confirm')?.addEventListener('click', () => {
        confirmOrder().catch(err => { console.error(err); alert('주문 처리 실패'); });
    });
});
