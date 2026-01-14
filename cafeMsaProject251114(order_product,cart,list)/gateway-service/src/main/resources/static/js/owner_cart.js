let itemModal;


/* ============================================
   🔹 페이지 캐시(bfcache) 복원 시 장바구니 재로딩
============================================ */
window.addEventListener('pageshow', function(event) {
    // event.persisted는 페이지가 bfcache에서 복원되었는지 알려줌
    if (event.persisted) {
        console.log('bfcache 복원 감지 → 장바구니 다시 로드');
        loadCartItems().catch(err => console.error('pageshow reload failed', err));
    }
});


document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();

    // 🔹 Bootstrap 모달 초기화
    const modalElement = document.getElementById('itemModal');
    if (modalElement) {
        itemModal = new bootstrap.Modal(modalElement);
    }
});

/* ============================================
   🔹 장바구니 전체 조회
============================================ */
async function loadCartItems() {
    try {
        const response = await fetch('/api/order_carts');
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

/* ============================================
   🔹 상품 수정 모달 열기
============================================ */
async function editCartItem(id) {
    try {
        const response = await fetch('/api/order_carts');
        if (!response.ok) throw new Error('장바구니 조회 실패');
        const items = await response.json();

        const item = items.find(i => i.id === id);
        if (!item) {
            alert('상품을 찾을 수 없습니다.');
            return;
        }

        document.getElementById('modalItemTitle').textContent = '상품 수정';
        // 한 줄씩 바로 value 설정 + 수정 불가 항목 readonly
        ['productId','productName','price'].forEach(key => {
            const el = document.getElementById(key);
            el.value = item[key];
            el.readOnly = true;
        });

        // itemId는 hidden input이라 따로 세팅
        document.getElementById('itemId').value = item.id;

        // 수량은 수정 가능
        const quantityInput = document.getElementById('quantity');
        quantityInput.value = item.quantity;
        quantityInput.readOnly = false;

        itemModal.show();

    } catch (error) {
        console.error('상품 정보를 불러오는데 실패했습니다:', error);
        alert('상품 정보를 불러오는데 실패했습니다.');
    }
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

    const url = id ? `/api/order_carts/${id}` : '/api/order_carts';
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


/* ============================================
   🔹 상품 삭제
============================================ */
async function deleteCartItem(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/api/order_carts/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('삭제 실패');

        alert('삭제되었습니다.');
        loadCartItems();

    } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
}

// ============================
// 🔹 장바구니 전체 비우기
// ============================
async function clearCart() {
    if (!confirm("정말 장바구니를 모두 비우시겠습니까?")) return;

    try {
        const response = await fetch('/api/order_carts/all', {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`장바구니 전체 삭제 실패: ${response.status}`);
        }

        alert("장바구니를 모두 비웠습니다.");
        await loadCartItems(); // ✅ 장바구니 목록 새로고침
    } catch (error) {
        console.error("장바구니 전체 삭제 오류:", error);
        alert("삭제 중 오류가 발생했습니다.");
    }
}


/* ============================================
   🔹 발주하기
============================================ */
async function orderItems() {
    try {
        const response = await fetch('/api/order_carts');
        if (!response.ok) throw new Error('장바구니 조회 실패');
        const items = await response.json();

        if (items.length === 0) {
            alert('발주할 상품이 없습니다.');
            return;
        }

        const orderRequest = {
            items: items.map(i => ({
                productId: i.productId,
                productName: i.productName,
                quantity: i.quantity,
                price: i.price
            }))
        };

        // 발주 생성
        const orderResponse = await fetch('/api/order_orderlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderRequest)
        });

        if (!orderResponse.ok) {
            const text = await orderResponse.text().catch(() => null);
            throw new Error('발주 요청 실패' + (text ? `: ${text}` : ''));
        }

        // 장바구니 전체 삭제 (서버에서 실제 삭제가 완료될 때까지 기다림)
        const delResponse = await fetch('/api/order_carts/all', { method: 'DELETE' });
        if (!delResponse.ok) {
            const text = await delResponse.text().catch(() => null);
            throw new Error('장바구니 전체 삭제 실패' + (text ? `: ${text}` : ''));
        }

        // 선택적: 삭제 반영된 화면을 확실히 갱신 (await 하여 완료 보장)
        await loadCartItems();

        alert('발주가 완료되었습니다.');

        // 발주내역 페이지로 이동
        // replace를 쓰면 히스토리에 현재 페이지가 남지 않아 Back으로 돌아왔을 때 캐시 문제가 줄음
        window.location.replace('/order_orderlist');

    } catch (error) {
        console.error('발주 실패:', error);
        alert('발주 처리 중 오류가 발생했습니다. (콘솔 확인)');
    }
}