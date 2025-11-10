document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
});

async function loadReviews() {
    try {
            // 변경된 부분: /api/reviews/product/${productId} 대신 쿼리 파라미터 사용
            const response = await fetch(`/api/reviews?productId=${productId}`);
        if (!response.ok) throw new Error('리뷰 불러오기 실패');
        const reviews = await response.json();

        const tbody = document.getElementById('reviewTableBody');
        tbody.innerHTML = '';

        reviews.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.id}</td>
                <td>${r.author}</td>
                <td>${r.content}</td>
                <td>${r.rating} / 5</td>
                <td>${r.createdAt}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        alert('리뷰를 불러오는 중 오류가 발생했습니다.');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadReviews(productId);

    // 검색 버튼 클릭 시
    document.getElementById('searchBtn').addEventListener('click', () => {
        const inputVal = document.getElementById('productIdInput').value.trim();
        if (!inputVal) {
            alert('상품 ID를 입력하세요.');
            return;
        }
        productId = inputVal;
        document.getElementById('currentProductId').textContent = productId;
        loadReviews(productId);
    });

    // 🔹 전체보기 버튼 클릭 시
    document.getElementById('resetBtn').addEventListener('click', () => {
        productId = null; // 필터 해제
        document.getElementById('productIdInput').value = ''; // 입력창 비우기
        document.getElementById('currentProductId').textContent = '전체';
        loadReviews(); // 전체 리뷰 다시 로드
    });
});
