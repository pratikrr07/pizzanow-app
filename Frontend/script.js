/**
 * PizzaNow Frontend - Main Menu Module
 * Handles menu display, search, cart management, and checkout
 */
const API_URL = "http://127.0.0.1:5000";

// Load and display menu items from the backend API
function loadMenu() {
    const q = (document.getElementById('search') || {}).value || '';
    fetch(`${API_URL}/menu`)
        .then(res => res.json())
        .then(data => {
            const menuDiv = document.getElementById("menu-items");
            menuDiv.innerHTML = "";

            const items = data.filter(i => i.name.toLowerCase().includes(q.toLowerCase()));

            items.forEach(item => {
                const div = document.createElement("div");
                div.className = "pizza-card";

                div.innerHTML = `
                    <img src="images/${item.image}" alt="${item.name}" />
                    <div class="pizza-info">
                        <h3>${item.name}</h3>
                        <div class="pizza-price">$${item.price}</div>
                    </div>
                    <button class="add-btn" onclick="addToCart(${item.id})">+</button>
                `;

                menuDiv.appendChild(div);
            });
        });
}


// Add a menu item to the shopping cart
function addToCart(itemId) {
    fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, quantity: 1 })
    }).then(() => loadCart());
}

// Fetch and render current cart contents
function loadCart() {
    fetch(`${API_URL}/cart`)
        .then(res => res.json())
        .then(data => {
            const cartList = document.getElementById("cart-items");
            cartList.innerHTML = "";
            data.cart.forEach(item => {
                const li = document.createElement("li");
                const imgSrc = item.image ? `images/${item.image}` : `images/margherita.jpg`;
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-left">
                        <img src="${imgSrc}" alt="" class="cart-thumb" />
                        <div class="cart-meta">
                            <div class="cart-name">${item.name}</div>
                            <div class="muted small">$${item.price.toFixed(2)} each</div>
                        </div>
                    </div>
                    <div class="cart-right">
                        <div class="cart-controls">
                            <button class="qty-btn" onclick="updateQty('${item.id}', 'remove')">-</button>
                            <div class="cart-qty">${item.quantity}</div>
                            <button class="qty-btn" onclick="updateQty('${item.id}', 'add')">+</button>
                        </div>
                        <div class="cart-line">$${(item.price*item.quantity).toFixed(2)}</div>
                        <button class="remove-link" onclick="removeItem('${item.id}', ${item.quantity})">Remove</button>
                    </div>
                `;
                cartList.appendChild(li);
            });

            document.getElementById("total-price").textContent = data.total_price;
            const badge = document.getElementById('cart-count');
            if (badge) badge.textContent = data.cart.reduce((s,i)=>s+i.quantity,0);
        });
}

// Remove item completely from cart
function removeItem(itemId, qty){
    // remove entire item by sending quantity equal to current qty
    fetch(`${API_URL}/cart/remove`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, quantity: qty })
    }).then(()=> loadCart());
}

// Update item quantity by adding or removing one unit
function updateQty(itemId, action) {
    const endpoint = action === "add" ? "/cart/add" : "/cart/remove";

    fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId })
    }).then(() => loadCart());
}

// Process checkout and clear cart on success
function checkout() {
    fetch(`${API_URL}/checkout`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(data => {
        const el = document.getElementById("order-msg");
        el.textContent = data.message ? `${data.message} — Paid $${data.total_paid}` : data.error;
        el.classList.remove('muted');
        loadCart();
    });
}




document.addEventListener('DOMContentLoaded', ()=>{
    const search = document.getElementById('search');
    if (search) search.addEventListener('input', () => loadMenu());
    loadMenu();
    loadCart();
});
