// static/js/nav-common.js

function b64urlDecode(str){
    try{
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        const pad = str.length % 4 ? 4 - (str.length % 4) : 0;
        if (pad) str += '='.repeat(pad);
        return decodeURIComponent(escape(atob(str)));
    }catch(e){
        return '';
    }
}

function parseJwtPayload(token){
    if (!token || token.split('.').length < 2) return null;
    try{
        const payload = token.split('.')[1];
        return JSON.parse(b64urlDecode(payload));
    }catch(e){
        return null;
    }
}

function normalizeRole(role){
    if (!role) return null;
    const r = String(role).toUpperCase();
    if (r.startsWith('ROLE_')) return r;
    if (r.includes('OWNER'))  return 'ROLE_OWNER';
    if (r.includes('USER'))   return 'ROLE_USER';
    return r;
}

function isAdminFromToken(token){
    const p = parseJwtPayload(token);
    if (!p) return false;

    const candidates = [];
    if (Array.isArray(p.authorities)) candidates.push(...p.authorities);
    if (Array.isArray(p.roles))       candidates.push(...p.roles);
    if (p.role)  candidates.push(p.role);
    if (p.auth)  candidates.push(p.auth);
    if (p.scope) candidates.push(p.scope);

    const flat = candidates
        .flatMap(v => Array.isArray(v) ? v : String(v).split(/[ ,]/))
        .filter(Boolean);

    return flat
        .map(normalizeRole)
        .some(v => v === 'ROLE_OWNER' || v === 'OWNER');
}

function $(id){
    return document.getElementById(id);
}

function safeToggle(el, show){
    if (el) el.classList.toggle('d-none', !show);
}

function applyUi(isAdmin, username, roleLabel){
    // ===== auth 영역 =====
    const loginNav    = $('loginNav');
    const userNav     = $('userNav');
    const logoutNav   = $('logoutNav');
    const navUsername = $('navUsername'); // 네비바 유저 이름 span

    if (username){
        // 로그인 상태
        safeToggle(loginNav, false);
        safeToggle(userNav, true);
        safeToggle(logoutNav, true);
        if (navUsername){
            navUsername.textContent = `${username ?? ''} (${roleLabel ?? '-'})`;
        }
    }else{
        // 비로그인 상태
        safeToggle(loginNav, true);
        safeToggle(userNav, false);
        safeToggle(logoutNav, false);

        if (loginNav){
            loginNav.innerHTML = '<a class="nav-link text-warning" href="/login">로그인해주세요</a>';
        }
    }

    // ===== nav 메뉴들 =====
    const ordersNav         = $('ordersNav');
    const favoritesNav      = $('favoritesNav');
    const purchaseNav       = $('purchaseNav');
    const purchaseCartNav   = $('purchaseCartNav');
    const purchaseOrdersNav = $('purchaseOrdersNav');
    const cartNav           = $('cartNav');
    const adminNav          = $('adminNav');

    const primaryOrderBtn   = $('primaryOrderBtn');
    const footerOrdersLink  = $('footerOrdersLink');
    const footerOrdersText  = $('footerOrdersText');

    if (isAdmin){
        // 관리자: 발주 메뉴들 ON, 일반 메뉴들 OFF
        safeToggle(purchaseNav, true);
        safeToggle(purchaseCartNav, true);
        safeToggle(purchaseOrdersNav, true);

        safeToggle(cartNav, false);
        safeToggle(ordersNav, false);
        safeToggle(favoritesNav, false);
        safeToggle(adminNav, true);

        if (primaryOrderBtn){
            primaryOrderBtn.href = '/order_products';
            primaryOrderBtn.innerHTML = '<i class="bi bi-list-check me-1"></i> 발주내역 확인';
        }
        if (footerOrdersLink) footerOrdersLink.setAttribute('href', '/order_products');
        if (footerOrdersText) footerOrdersText.textContent = '발주';
    }else{
        // 일반 유저 / 비로그인
        safeToggle(purchaseNav, false);
        safeToggle(purchaseCartNav, false);
        safeToggle(purchaseOrdersNav, false);

        safeToggle(cartNav, true);
        safeToggle(ordersNav, true);
        safeToggle(favoritesNav, true);
        safeToggle(adminNav, false);

        if (primaryOrderBtn){
            if (username) {
                // 로그인 상태
                primaryOrderBtn.href = '/orders';
                primaryOrderBtn.innerHTML = '<i class="bi bi-receipt me-1"></i> 내 주문 확인';
            } else {
                // 비로그인 상태
                primaryOrderBtn.href = '/login';
                primaryOrderBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> 로그인하러가기';
            }
        }
        if (footerOrdersLink) footerOrdersLink.setAttribute('href', '/orders');
        if (footerOrdersText) footerOrdersText.textContent = '주문';
    }
}

function checkLoginStatus(){
    const token    = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    let role       = normalizeRole(localStorage.getItem('role'));

    // 로그인 안 된 상태
    if (!(token && username)){
        applyUi(false, null, null);
        return;
    }

    const isAdminLocal = role === 'ROLE_OWNER';
    applyUi(isAdminLocal, username, role ?? 'USER');

    // JWT payload 기준으로 한 번 더 동기화
    const isAdminJwt = isAdminFromToken(token);

    if (isAdminJwt && !isAdminLocal){
        localStorage.setItem('role', 'ROLE_OWNER');
        applyUi(true, username, 'ROLE_OWNER');
    }else if (!isAdminJwt && isAdminLocal){
        localStorage.setItem('role', 'ROLE_USER');
        applyUi(false, username, 'ROLE_USER');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const y = $('year');
    if (y) y.textContent = new Date().getFullYear();

    checkLoginStatus();

    const logoutBtn = $('logoutBtn');
    if (logoutBtn){
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            location.href = '/login';
        });
    }
});