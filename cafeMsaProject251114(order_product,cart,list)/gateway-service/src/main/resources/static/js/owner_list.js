let orderModal;

document.addEventListener('DOMContentLoaded', function () {
    const modalElement = document.getElementById('orderModal');
    if (modalElement) {
        orderModal = new bootstrap.Modal(modalElement);
    }

    loadOrderList();
});

// ============================
// 발주 내역 전체 조회
// ============================
async function loadOrderList() {
    try {
        const response = await fetch('/api/order_orderlist');
        if (!response.ok) throw new Error('발주 내역 불러오기 실패');
        const orders = await response.json();

        const tbody = document.getElementById('orderListTableBody'); // HTML id와 맞춤
        tbody.innerHTML = '';

        orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.id}</td>
                <td>${new Date(order.orderDate).toLocaleString()}</td>
                <td>${order.totalPrice.toLocaleString()} 원</td>
                <td>
                    <button class="btn btn-outline-coffee ms-2" onclick="viewOrderItems(${order.id})">상세보기</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('발주 내역 조회 오류:', error);
        alert('발주 내역을 불러오는데 실패했습니다.');
    }
}

// ============================
// 발주 상세보기 모달 열기
// ============================
async function viewOrderItems(orderId) {
    try {
        const response = await fetch('/api/order_orderlist');
        if (!response.ok) throw new Error('발주 상세 불러오기 실패');
        const orders = await response.json();

        const order = orders.find(o => o.id === orderId);
        if (!order) {
            alert('발주를 찾을 수 없습니다.');
            return;
        }

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = ''; // 초기화

        // 테이블 생성
        const table = document.createElement('table');
        table.className = 'table table-bordered table-striped';

        // 테이블 헤더
        table.innerHTML = `
            <thead class="table-light">
                <tr>
                    <th>상품명</th>
                    <th>수량</th>
                    <th>가격</th>
                    <th>합계</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        let totalSum = 0;

        order.items.forEach(item => {
            const rowTotal = item.quantity * item.price;
            totalSum += rowTotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} 원</td>
                <td>${rowTotal.toLocaleString()} 원</td>
            `;
            tbody.appendChild(tr);
        });

        // 총합 행 추가
        const trTotal = document.createElement('tr');
        trTotal.className = 'table-secondary fw-bold';
        trTotal.innerHTML = `
            <td colspan="3" class="text-end">총 합계</td>
            <td>${totalSum.toLocaleString()} 원</td>
        `;
        tbody.appendChild(trTotal);

        modalBody.appendChild(table);

        // 모달 열기
        orderModal.show();
    } catch (error) {
        console.error('발주 상세 조회 오류:', error);
        alert('발주 상세를 불러오는데 실패했습니다.');
    }
}

