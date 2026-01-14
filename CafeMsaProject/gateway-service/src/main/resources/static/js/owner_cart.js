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
        const emptyBox = document.getElementById('cart-empty');
        const tableCard = document.getElementById('cartTableBody')?.closest('.card.card-elevated');

        // 안전하게 초기화
        tbody.innerHTML = '';
        document.getElementById('cartTotal').textContent = '0';

        if (!Array.isArray(items) || items.length === 0) {
            if (emptyBox) emptyBox.classList.remove('d-none');
            if (tableCard) tableCard.classList.add('d-none');
            return;
        }

        if (emptyBox) emptyBox.classList.add('d-none');
        if (tableCard) tableCard.classList.remove('d-none');

        let totalSum = 0;

        items.forEach(item => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            const total = price * quantity;
            totalSum += total;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.productId}</td>
                <td>${item.productName}</td>
                <td>
                    <div class="input-group input-group-sm" style="width:150px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${item.id}, -1)">−</button>
                        <input type="text" id="qty-${item.id}" class="form-control text-center" value="${quantity}" />
                        <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                </td>
                <td>${price.toLocaleString()} 원</td>
                <td>${total.toLocaleString()} 원</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCartItem(${item.id})">삭제</button>
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



/// 수량 변경 함수
function changeQuantity(itemId, delta) {
    const input = document.getElementById(`qty-${itemId}`);
    let current = parseInt(input.value);

    if (isNaN(current)) {
        current = 0; // NaN이면 기본값 0으로 설정
    }

    current += delta;

    if (current < 1) current = 1; // 최소 1개 유지
    input.value = current;

    // 서버에 수량 업데이트 요청 보내기
    updateCartItemQuantity(itemId, current);
}

// 수량 업데이트 요청
async function updateCartItemQuantity(itemId, quantity) {
    try {

        // 1) 전체 목록 불러와서 해당 item 찾기
        const listRes = await fetch('/api/order_carts');
        if (!listRes.ok) throw new Error("장바구니 전체 조회 실패");
        const items = await listRes.json();

        const item = items.find(i => i.id === itemId);
        if (!item) throw new Error("아이템을 찾을 수 없음");

        // 2) 기존 정보 + 변경된 수량 포함하여 전체 객체 전송
        const updatedItem = {
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: quantity
        };

        const response = await fetch(`/api/order_carts/${itemId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedItem)
        });

        if (!response.ok) throw new Error("수량 업데이트 실패");

        loadCartItems();

    } catch (error) {
        console.error("수량 업데이트 오류:", error);
        alert("수량 업데이트 실패");
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