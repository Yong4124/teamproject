async function loadCustomers() {
    const res = await fetch("/api/customers");
    const customers = await res.json();
    const tbody = document.getElementById("customer-table");
    tbody.innerHTML = "";

    customers.forEach(c => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${c.id}</td>
            <td><input type="text" value="${c.name}" id="name-${c.id}"></td>
            <td><input type="text" value="${c.email}" id="email-${c.id}"></td>
            <td>
                <button onclick="updateCustomer(${c.id})">수정</button>
                <button onclick="deleteCustomer(${c.id})">삭제</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

async function addCustomer() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if (!name || !email) {
        alert("이름과 이메일을 입력하세요!");
        return;
    }

    await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
    });

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    loadCustomers();
}

async function updateCustomer(id) {
    const name = document.getElementById(`name-${id}`).value;
    const email = document.getElementById(`email-${id}`).value;

    await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
    });

    loadCustomers();
}

async function deleteCustomer(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    loadCustomers();
}

document.addEventListener("DOMContentLoaded", loadCustomers);