let itemModal;

document.addEventListener('DOMContentLoaded', function() {
    const itemModalElement = document.getElementById('itemModal');
    if (itemModalElement) {
        itemModal = new bootstrap.Modal(itemModalElement);
    }

    loadCartItems();
});

// ============================
// 장바구니 항목 전체 조회
// ============================
async function loadCartItems() {
    try {
        const response = await fetch('/api/carts');
        if (!response.ok) throw new Error('데이터 불러오기 실패');
        const items = await response.json();

        const tbody = document.getElementById('cartTableBody');
        tbody.innerHTML = '';

        let totalSum = 0;

        items.forEach(item => {
            const total = item.price * item.quantity;
            totalSum += total;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.productId}</td>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} 원</td>
                <td>${total.toLocaleString()} 원</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editCartItem(${item.id})">수정</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCartItem(${item.id})">삭제</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('cartTotal').textContent = totalSum.toLocaleString();
    } catch (error) {
        console.error('장바구니 목록을 불러오는데 실패했습니다:', error);
        alert('장바구니 목록을 불러오는데 실패했습니다.');
    }
}

// ============================
// 상품 추가 모달 열기
// ============================
function showAddItemModal() {
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('modalItemTitle').textContent = '상품 추가';
    itemModal.show();
}

// ============================
// 상품 저장 (추가 / 수정)
// ============================
async function saveCartItem() {
    const id = document.getElementById('itemId').value;
    const item = {
        productId: parseInt(document.getElementById('productId').value),
        productName: document.getElementById('productName').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price: parseFloat(document.getElementById('price').value)
    };

    const url = id ? `/api/carts/${id}` : '/api/carts';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });

        if (!response.ok) throw new Error('저장 실패');
        itemModal.hide();
        loadCartItems();
        alert('저장되었습니다.');
    } catch (error) {
        console.error('저장 실패:', error);
        alert('저장에 실패했습니다.');
    }
}

// ============================
// 상품 수정 모달 열기
// ============================
async function editCartItem(id) {
    try {
        const response = await fetch('/api/carts');
        const items = await response.json();
        const item = items.find(i => i.id === id);

        if (!item) {
            alert('상품을 찾을 수 없습니다.');
            return;
        }

        document.getElementById('modalItemTitle').textContent = '상품 수정';
        document.getElementById('itemId').value = item.id;
        document.getElementById('productId').value = item.productId;
        document.getElementById('productName').value = item.productName;
        document.getElementById('quantity').value = item.quantity;
        document.getElementById('price').value = item.price;

        itemModal.show();
    } catch (error) {
        console.error('상품 정보를 불러오는데 실패했습니다:', error);
        alert('상품 정보를 불러오는데 실패했습니다.');
    }
}

// ============================
// 상품 삭제
// ============================
async function deleteCartItem(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/api/carts/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('삭제 실패');

        loadCartItems();
        alert('삭제되었습니다.');
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
}

// ============================
// 발주하기
// ============================
async function orderItems() {
    try {
        // 1. 장바구니 목록 불러오기
        const response = await fetch('/api/carts');
        if (!response.ok) throw new Error('장바구니 조회 실패');
        const items = await response.json();

        if (items.length === 0) {
            alert('발주할 상품이 없습니다.');
            return;
        }

        // 2. 발주 데이터 구성
        const orderRequest = {
            items: items.map(i => ({
                productId: i.productId,
                productName: i.productName,
                quantity: i.quantity,
                price: i.price
            }))
        };

        // 3. 발주 요청 보내기
        const orderResponse = await fetch('/api/orderlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderRequest)
        });

        if (!orderResponse.ok) throw new Error('발주 요청 실패');

        // 4. 발주 성공 → 장바구니 전체 삭제
        await fetch('/api/carts/all', { method: 'DELETE' });

        alert('발주가 완료되었습니다.');
        loadCartItems();

        window.location.href = "/orderlist";
    } catch (error) {
        console.error('발주 실패:', error);
        alert('발주 처리 중 오류가 발생했습니다.');
    }
}
