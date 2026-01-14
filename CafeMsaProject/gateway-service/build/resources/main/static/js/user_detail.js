// /js/user_detail.js

// ===== 공통 유저 / 헤더 =====
let CURRENT_USER_ID = null;

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

// ===== 유틸 =====
const getById = (id) => document.getElementById(id);

function orderIdFromPath() {
    return location.pathname.split('/').pop();
}

function money(n) {
    return (Number(n) || 0).toLocaleString() + '원';
}

// ✅ 로딩 토글(d-none 사용)
function showLoading(on) {
    const el = getById('loading');
    if (!el) return;

    if (on) {
        el.classList.remove('d-none');
    } else {
        el.classList.add('d-none');
    }
}

// 상태 뱃지 (주문 상세 상단용)
function renderStatusBadge(status) {
    if (!status) status = 'NEW';
    const s = String(status).toUpperCase();

    let bg = 'bg-secondary';
    let text = 'text-white';
    let icon = 'bi-hourglass-split';
    let label = s;

    if (s === 'NEW') {
        bg = 'bg-primary';
        icon = 'bi-bag-plus';
        label = 'NEW';
    } else if (s === 'PAID' || s === 'PROCESSING') {
        bg = 'bg-warning';
        text = 'text-dark';
        icon = 'bi-cash-coin';
        label = '결제완료';
    } else if (s === 'COMPLETED') {
        bg = 'bg-success';
        icon = 'bi-check2-circle';
        label = '완료';
    } else if (s === 'CANCELLED' || s === 'FAILED' || s === 'CANCELED') {
        bg = 'bg-danger';
        icon = 'bi-x-circle';
        label = '취소';
    }

    return `
        <span class="order-status-badge ${bg} ${text}">
            <i class="bi ${icon}"></i>${label}
        </span>
    `;
}

// ===== 주문 상세 로딩 =====
async function loadDetail() {
    const tbody      = getById('tbody');
    const meta       = getById('meta');
    const tableCard  = getById('tableCard');
    const orderNoEl  = getById('orderNo');
    const statusWrap = getById('statusWrap');
    const qtyEl      = getById('qty');
    const totalEl    = getById('total');
    const errorBox   = getById('error');

    showLoading(true);
    if (errorBox) {
        errorBox.classList.add('d-none');
        errorBox.textContent = '';
    }
    if (tableCard) tableCard.classList.add('d-none');
    if (tbody) tbody.innerHTML = '';

    try {
        const res = await fetch(`/api/orders/${orderIdFromPath()}`, {
            headers: buildHeaders()
        });
        if (!res.ok) throw new Error(`주문 조회 실패 (${res.status})`);

        const o = await res.json();
        console.log('[order detail]', o);

        const items = o.items || [];
        const itemCount = o.totalQuantity ?? items.length;

        // 총액 계산
        let computedTotal = 0;
        for (const it of items) {
            computedTotal += (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0);
        }
        const totalAmount = o.totalAmount ?? computedTotal;

        // 상단 메타 영역
        if (orderNoEl) {
            orderNoEl.textContent = `#${o.id ?? '---'}`;
        }

        if (statusWrap) {
            statusWrap.innerHTML = renderStatusBadge(o.status);
        }

        if (qtyEl) {
            qtyEl.textContent = itemCount || 0;
        }

        if (totalEl) {
            totalEl.textContent = money(totalAmount);
        }

        if (meta) {
            const parts = [];
            const createdAt =
                o.createdAt || o.orderDate || o.orderedAt || o.orderTime || '';

            if (createdAt) parts.push(createdAt);
            if (o.paymentMethod) parts.push(`결제수단: ${o.paymentMethod}`);
            if (itemCount != null) parts.push(`품목수 ${itemCount}개`);

            meta.textContent = parts.join(' · ');
        }

        // 상세 품목 테이블 렌더링
        if (tbody) {
            for (const it of items) {
                const sub = (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0);

                const name =
                    it.productName ||
                    it.name ||
                    `상품 #${it.productId ?? ''}`;

                const imgSrc =
                    it.imageUrl || it.image_url || '';

                const hasImg = !!imgSrc;
                const imgHtml = hasImg
                    ? `
                        <img src="${imgSrc}"
                             alt="${name}"
                             class="checkout-product-thumb">
                      `
                    : `
                        <div class="checkout-product-thumb d-flex align-items-center justify-content-center">
                            <i class="bi bi-cup-hot"></i>
                        </div>
                      `;

                const metaParts = [];
                if (it.size) metaParts.push(it.size);
                if (it.option) metaParts.push(it.option);
                if (it.category) metaParts.push(it.category);
                const metaText = metaParts.join(' · ');

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="checkout-product-info">
                            ${imgHtml}
                            <div>
                                <div class="checkout-product-name">${name}</div>
                                ${
                    metaText
                        ? `<div class="checkout-product-meta">${metaText}</div>`
                        : ''
                }
                            </div>
                        </div>
                    </td>
                    <td class="text-end checkout-price-cell">${money(it.unitPrice)}</td>
                    <td class="text-end checkout-qty-cell">${it.quantity}</td>
                    <td class="text-end checkout-subtotal-cell">${money(sub)}</td>
                `;
                tbody.appendChild(tr);
            }
        }

        if (tableCard) tableCard.classList.remove('d-none');
    } catch (e) {
        console.error(e);
        if (errorBox) {
            errorBox.textContent = e.message || '주문 정보를 불러오지 못했습니다.';
            errorBox.classList.remove('d-none');
        }
    } finally {
        showLoading(false);
    }
}

// ===== 초기 진입 =====
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

    CURRENT_USER_ID = userIdFromNew || userIdFromLocal || userIdFromSess;
    if (!CURRENT_USER_ID) {
        alert('로그인 정보가 올바르지 않습니다. 다시 로그인 해주세요.');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        location.href = '/login';
        return;
    }
    CURRENT_USER_ID = String(CURRENT_USER_ID);

    loadDetail().catch(console.error);

    const btnPrint = document.getElementById('btn-print');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => window.print());
    }
});
