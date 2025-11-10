const UID = sessionStorage.getItem('USER_ID') || localStorage.getItem('USER_ID') || '1';
function h() { return { 'X-USER-ID': UID, 'Accept': 'application/json' }; }

// 금액 포맷팅 함수
function money(n){ return (Number(n)||0).toLocaleString() + '원'; }

// 상태 배지 생성 함수
function badge(status) {
    let className = 'bg-secondary';
    switch(status.toUpperCase()) {
        case 'NEW':
        case 'PAID':
            className = 'bg-primary';
            break;
        case 'COMPLETED':
            className = 'bg-success';
            break;
        case 'CANCELLED':
        case 'FAILED':
            className = 'bg-danger';
            break;
    }
    return `<span class="badge status-badge ${className}">${status}</span>`;
}

async function loadList() {
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');
    const tbody = document.getElementById('tbody');

    // ✅ 수정 1: 로딩 시작 시 d-none 클래스를 제거합니다.
    if (loading) loading.classList.remove('d-none');
    empty.style.display = 'none';
    tbody.innerHTML = '';

    try {
        const res = await fetch('/api/orders', { headers: h() });

        if (!res.ok) throw new Error('주문 목록 조회 실패');

        const list = await res.json();
        console.log('받은 데이터:', list);

        if (!list || !list.length) {
            // ✅ 수정 2: 빈 목록일 경우에도 로딩을 d-none으로 숨깁니다.
            if (loading) loading.classList.add('d-none');
            empty.style.display = '';
            return;
        }

        // 주문 목록을 테이블에 추가 (이전 수정사항 포함)
        for (const o of list) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><a href="/orders/${o.id}">#${o.id}</a></td>
                <td>${badge(o.status)}</td>
                <td class="text-end">${o.totalQuantity}</td>
                <td class="text-end fw-semibold">${money(o.totalAmount)}</td>
                <td class="text-end"><a class="btn btn-sm btn-outline-secondary" href="/orders/${o.id}">상세보기</a></td>
            `;
            tbody.appendChild(tr);
        }
    } catch (e) {
        console.error('주문 목록 불러오기 오류:', e);
        alert('주문 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
        // ✅ 수정 3: 로딩 종료 시 d-none 클래스를 추가하여 숨깁니다.
        if (loading) loading.classList.add('d-none');
    }
}


document.addEventListener('DOMContentLoaded', () => loadList().catch(console.error));