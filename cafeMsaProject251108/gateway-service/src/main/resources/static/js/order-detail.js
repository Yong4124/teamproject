// /js/order-detail.js
const UID = sessionStorage.getItem('USER_ID') || localStorage.getItem('USER_ID') || '1';
const H  = { 'X-USER-ID': UID, 'Accept': 'application/json' };
const $  = (id) => document.getElementById(id);

function orderIdFromPath() { return location.pathname.split('/').pop(); }
function money(n){ return (Number(n)||0).toLocaleString() + '원'; }
function showLoading(on){
    const el = $('loading');
    if (el) el.classList.toggle('d-none', !on);
}

async function loadDetail() {
    const tbody    = $('tbody');
    const sumEl    = $('sum');
    const meta     = $('meta');
    const skeleton = $('skeleton');
    const table    = $('tableCard');

    showLoading(true);
    if (skeleton) skeleton.classList.remove('d-none');
    if (table)    table.classList.add('d-none');
    if (tbody)    tbody.innerHTML = '';

    try {
        const res = await fetch(`/api/orders/${orderIdFromPath()}`, { headers: H });
        if (!res.ok) throw new Error(`주문 조회 실패 (${res.status})`);
        const o = await res.json();

        // API 응답 확인
        console.log(o);  // API 응답 데이터 확인
        console.log(o.items);  // 품목 정보 확인

        // 메타 정보 추가 (주문번호, 상태, 품목수)
        if (meta) meta.textContent = `주문번호 #${o.id} · 상태: ${o.status} · 품목수: ${o.totalQuantity}`;

        // 주문 번호 표시 (빈 값 처리)
        document.getElementById('orderNo').textContent = `#${o.id || '---'}`;

        // ✨ 상태 표시 업데이트 (추가/수정)
        const statusWrap = document.getElementById('statusWrap');
        if (statusWrap) {
            // 상태에 따른 배지 색상 결정 로직을 추가할 수 있지만, 여기서는 임시로 'bg-secondary' 사용
            const badgeClass = o.status === 'NEW' ? 'bg-primary' : 'bg-secondary'; // 예시
            statusWrap.innerHTML = `<span class="badge status-badge ${badgeClass}">${o.status || '---'}</span>`;
        }

        // ✨ 품목수 표시 업데이트 (추가)
        const qtyEl = document.getElementById('qty');
        if (qtyEl) qtyEl.textContent = o.totalQuantity || 0;

        // 품목
        let total = 0;
        for (const it of (o.items || [])) {
            const sub = (it.unitPrice || 0) * (it.quantity || 0);
            total += sub;
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${it.productName}</td>
              <td class="text-end">${money(it.unitPrice)}</td>
              <td class="text-end">${it.quantity}</td>
              <td class="text-end fw-semibold">${money(sub)}</td>`;
            tbody.appendChild(tr);
        }

        // 총 금액 설정 (빈 값 처리)
        if (sumEl) sumEl.textContent = money(total || o.totalAmount);

        // 주문 총 금액 표시
        document.getElementById('total').textContent = money(total || o.totalAmount);  // 총 금액 표시

        if (skeleton) skeleton.classList.add('d-none');
        if (table)    table.classList.remove('d-none');
    } catch (e) {
        console.error(e);
        const err = $('error');
        if (err) {
            err.textContent = e.message || '주문 정보를 불러오지 못했습니다.';
            err.classList.remove('d-none');
        }
        if (skeleton) skeleton.classList.add('d-none');
    } finally {
        showLoading(false); // 로딩 끄기
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadDetail().catch(console.error);
    $('btn-print')?.addEventListener('click', () => window.print());
});