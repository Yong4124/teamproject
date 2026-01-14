// /js/user_list.js

// ===== 로그인한 유저 ID 전역 =====
let CURRENT_USER_ID = null;

// 공통 헤더 생성 함수
function buildHeaders(extra = {}) {
    if (!CURRENT_USER_ID) {
        alert('로그인이 필요합니다.');
        location.href = '/login';
        throw new Error('로그인 필요');  // fetch 진행 막기용
    }

    return {
        'X-USER-ID': CURRENT_USER_ID,
        'Accept': 'application/json',
        ...extra,
    };
}

// 금액 포맷팅 함수
function money(n) {
    return (Number(n) || 0).toLocaleString() + '원';
}

// ===== 상태 뱃지 렌더링 (디자인용) =====
function renderStatusBadge(status) {
    if (!status) status = 'NEW';
    const s = String(status).toUpperCase();

    let cls = 'new';
    let icon = 'bi-hourglass-split';
    let label = s;

    if (s === 'NEW') {
        cls = 'new';
        icon = 'bi-bag-plus';
        label = 'NEW';
    } else if (s === 'PAID' || s === 'PROCESSING') {
        cls = 'paid';
        icon = 'bi-cash-coin';
        label = '결제완료';
    } else if (s === 'COMPLETED') {
        cls = 'completed';
        icon = 'bi-check2-circle';
        label = '완료';
    } else if (s === 'CANCELLED' || s === 'FAILED' || s === 'CANCELED') {
        cls = 'cancelled';
        icon = 'bi-x-circle';
        label = '취소';
    }

    return `
        <span class="order-status-badge ${cls}">
            <i class="bi ${icon}"></i>${label}
        </span>
    `;
}

// ===== 주문 목록 로딩 =====
async function loadList() {
    const loading   = document.getElementById('loading');
    const empty     = document.getElementById('empty');
    const tbody     = document.getElementById('tbody');
    const tableCard = document.getElementById('orderTableCard');

    // 로딩 표시
    if (loading)   loading.classList.remove('d-none');
    if (empty)     empty.classList.add('d-none');
    if (tbody)     tbody.innerHTML = '';
    if (tableCard) tableCard.classList.remove('d-none');

    try {
        const res = await fetch('/api/orders', { headers: buildHeaders() });
        if (!res.ok) throw new Error('주문 목록 조회 실패');

        const list = await res.json();
        console.log('받은 데이터:', list);

        if (!list || !list.length) {
            // 비어 있을 때
            if (loading)   loading.classList.add('d-none');
            if (empty)     empty.classList.remove('d-none');
            if (tableCard) tableCard.classList.add('d-none');
            return;
        }

        for (const o of list) {
            const tr = document.createElement('tr');
            const orderUrl = `/orders/${o.id}`;

            tr.innerHTML = `
                <td class="order-id-cell">
                    <a href="${orderUrl}">#${o.id}</a>
                </td>
                <td class="order-status-cell">
                    ${renderStatusBadge(o.status)}
                </td>
                <td class="order-count-cell text-end">
                    ${o.totalQuantity}
                </td>
                <td class="order-amount-cell text-end">
                    ${money(o.totalAmount)}
                </td>
                <td class="order-detail-cell">
                    <a class="btn btn-sm btn-outline-coffee order-detail-btn" href="${orderUrl}">
                        상세보기
                    </a>
                </td>
            `;
            tbody.appendChild(tr);
        }

        if (tableCard) tableCard.classList.remove('d-none');
    } catch (e) {
        console.error('주문 목록 불러오기 오류:', e);
        alert('주문 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
        if (loading) loading.classList.add('d-none');
    }
}

// ===== 초기 진입 =====
document.addEventListener('DOMContentLoaded', async () => {
    // products.js / user_cart.js와 동일한 로그인 체크
    const token    = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    // 로그인 여부는 token + username 기준으로만 판단
    if (!token || !username) {
        alert('로그인이 필요합니다.');
        location.href = '/login';
        return;
    }

    const userIdFromNew   = localStorage.getItem('userId');
    const userIdFromLocal = localStorage.getItem('USER_ID');
    const userIdFromSess  = sessionStorage.getItem('USER_ID');

    // 👉 더 이상 '1' 같은 임시값 사용 X
    CURRENT_USER_ID = userIdFromNew || userIdFromLocal || userIdFromSess;

    if (!CURRENT_USER_ID) {
        alert('로그인 정보가 올바르지 않습니다. 다시 로그인 해주세요.');
        // 필요하면 토큰도 정리
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        location.href = '/login';
        return;
    }

    CURRENT_USER_ID = String(CURRENT_USER_ID);

    console.debug('[orders list] token=', token,
        'username=', username,
        'X-USER-ID=', CURRENT_USER_ID);

    await loadList().catch(console.error);
});
