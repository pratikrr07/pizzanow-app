const API_URL = "http://127.0.0.1:5000";

function getImageForName(name) {
    const key = (name || '').toLowerCase();
    if (key.includes('pepper')) return 'images/pepperoni.jpg';
    if (key.includes('margherita') || key.includes('marg')) return 'images/margherita.jpg';
    if (key.includes('cheese') || key.includes('four') || key.includes('4')) return 'images/cheese.jpg';
    if (key.includes('hawai') || key.includes('pineapple')) return 'images/hawaiian.jpg';
    if (key.includes('veggie') || key.includes('veget')) return 'images/veggie.jpg';
    return 'images/margherita.jpg';
}

function refreshCheckout() {
    fetch(`${API_URL}/cart`)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("checkout-items");
        list.innerHTML = "";

        let subtotal = 0;

        data.cart.forEach(item => {
            subtotal += item.price * item.quantity;

            const li = document.createElement("li");
            li.className = 'pizza-card';

            const img = document.createElement('img');
            if (item.image) img.src = `images/${item.image}`; else img.src = getImageForName(item.name);
            img.alt = item.name;

            const info = document.createElement('div');
            info.className = 'pizza-info';

            const title = document.createElement('h3');
            title.textContent = `${item.name} x ${item.quantity}`;

            const linePrice = document.createElement('div');
            linePrice.className = 'pizza-price';
            linePrice.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

            info.appendChild(title);
            info.appendChild(linePrice);

            li.appendChild(img);
            li.appendChild(info);
            list.appendChild(li);
        });

        const tax = +(subtotal * 0.18).toFixed(2);
        const total = +(subtotal + tax).toFixed(2);

        document.getElementById("subtotal").textContent = subtotal.toFixed(2);
        document.getElementById("tax").textContent = tax.toFixed(2);
        document.getElementById("total").textContent = total.toFixed(2);
    });
}

document.addEventListener('DOMContentLoaded', refreshCheckout);

function placeOrder() {
    const btn = document.getElementById('place-order');
    if (btn) btn.disabled = true;

    fetch(`${API_URL}/checkout`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
            const msg = document.getElementById("msg");
            if (data.error) {
                if (msg) msg.textContent = data.error;
                if (btn) btn.disabled = false;
                return;
            }

            if (msg) msg.textContent = `Order placed successfully — Paid $${data.total_paid}`;
            refreshCheckout();
            // after a short delay redirect back to menu
            setTimeout(()=> window.location.href = 'index.html', 1800);
        })
        .catch(err => {
            const msg = document.getElementById("msg");
            if (msg) msg.textContent = 'Network error';
            if (btn) btn.disabled = false;
        });
}
