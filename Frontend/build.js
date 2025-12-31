/**
 * PizzaNow Frontend - Build Your Own Pizza Module
 * Custom pizza builder with size, crust, and toppings selection
 */
const API_URL = "http://127.0.0.1:5000";

// Available pizza sizes and prices
const sizes = [
    { id: 'small', label: 'Small', price: 9.99 },
    { id: 'medium', label: 'Medium', price: 12.99 },
    { id: 'large', label: 'Large', price: 15.99 }
];

// Available pizza toppings with pricing
const toppings = [
    { id: 'pepperoni', label: 'Pepperoni', price: 1.5 },
    { id: 'mushrooms', label: 'Mushrooms', price: 1.0 },
    { id: 'onions', label: 'Onions', price: 0.8 },
    { id: 'sausage', label: 'Sausage', price: 1.7 },
    { id: 'bacon', label: 'Bacon', price: 1.8 },
    { id: 'extra_cheese', label: 'Extra Cheese', price: 1.2 },
    { id: 'pineapple', label: 'Pineapple', price: 1.4 },
    { id: 'olives', label: 'Olives', price: 0.9 }
];

// Format price values to currency string
function format(v){return '$' + v.toFixed(2)}

// Initialize pizza builder UI with size, crust, and topping options
function renderBuilder(){
    const sizesDiv = document.getElementById('sizes');
    sizesDiv.innerHTML = '';
    sizes.forEach(s=>{
        const id = 'size-'+s.id;
        const el = document.createElement('label');
        el.style.marginRight = '12px';
        el.innerHTML = `<input type="radio" name="size" value="${s.id}" data-price="${s.price}" ${s.id==='medium'?'checked':''}/> ${s.label} (${format(s.price)})`;
        sizesDiv.appendChild(el);
    });

    const tops = document.getElementById('toppings');
    tops.innerHTML = '';
    toppings.forEach(t=>{
        const el = document.createElement('label');
        el.innerHTML = `<input type="checkbox" value="${t.id}" data-price="${t.price}" /> <span class="top-label">${t.label}</span> <span class="top-price">(+${format(t.price)})</span>`;
        // toggle visual checked state on change
        const cb = el.querySelector('input');
        cb.addEventListener('change', (e)=>{
            if (e.target.checked) el.classList.add('checked'); else el.classList.remove('checked');
            updateTotal();
        });
        tops.appendChild(el);
    });

    // events
    document.querySelectorAll('#builder input, #builder select').forEach(i=>i.addEventListener('change', updateTotal));
    document.getElementById('quantity').addEventListener('input', updateTotal);
    document.getElementById('add-to-cart').addEventListener('click', addCustomToCart);

    updateTotal();
}

// Recalculate pizza price based on selections and update preview
function updateTotal(){
    const selectedSize = document.querySelector('input[name="size"]:checked');
    const sizePrice = selectedSize ? parseFloat(selectedSize.dataset.price) : 0;
    const crust = document.getElementById('crust');
    const crustMod = parseFloat(crust.options[crust.selectedIndex].dataset.mod || 0);

    let toppingsTotal = 0;
    document.querySelectorAll('#toppings input[type=checkbox]:checked').forEach(cb=>{
        toppingsTotal += parseFloat(cb.dataset.price || 0);
    });

    const qty = Math.max(1, parseInt(document.getElementById('quantity').value || 1));
    const line = (sizePrice + crustMod + toppingsTotal) * qty;
    document.getElementById('total').textContent = format(line);

    const title = `${selectedSize ? selectedSize.value.charAt(0).toUpperCase()+selectedSize.value.slice(1) : 'Custom'} Pizza`;
    document.getElementById('preview-title').textContent = title;
    document.getElementById('preview-line').textContent = format(line);
    // update summary values on the right
    document.getElementById('summary-qty').textContent = qty;
    document.getElementById('summary-sub').textContent = format((sizePrice + crustMod + toppingsTotal) * qty);
    const tax = +( (sizePrice + crustMod + toppingsTotal) * qty * 0.18 ).toFixed(2);
    document.getElementById('summary-tax').textContent = format(tax);
    document.getElementById('summary-total').textContent = format((sizePrice + crustMod + toppingsTotal) * qty + tax);
}

// Create custom pizza payload and add to cart via API
function addCustomToCart(){
    const qty = Math.max(1, parseInt(document.getElementById('quantity').value || 1));
    const selectedSize = document.querySelector('input[name="size"]:checked');
    const sizeLabel = selectedSize ? selectedSize.value : 'custom';
    const crust = document.getElementById('crust').value;
    const chosen = Array.from(document.querySelectorAll('#toppings input[type=checkbox]:checked')).map(c=>c.value);

    // compute price again
    const sizePrice = selectedSize ? parseFloat(selectedSize.dataset.price) : 0;
    const crustMod = parseFloat(document.getElementById('crust').options[document.getElementById('crust').selectedIndex].dataset.mod || 0);
    let toppingsTotal = 0;
    chosen.forEach(id=>{
        const t = toppings.find(x=>x.id===id);
        if (t) toppingsTotal += t.price;
    });
    const price = +(sizePrice + crustMod + toppingsTotal).toFixed(2);

    const payload = {
        custom: true,
        name: `Build: ${sizeLabel} / ${crust}` + (chosen.length? ` / ${chosen.join(',')}` : ''),
        price: price,
        quantity: qty,
        meta: { size: sizeLabel, crust, toppings: chosen }
    };

    // include the image filename to keep preview consistent in cart
    let img = 'build.jpg';
    if (chosen.includes('pineapple')) img = 'hawaiian.jpg';
    else if (chosen.includes('pepperoni')) img = 'pepperoni.jpg';
    else if (chosen.includes('extra_cheese')) img = 'cheese.jpg';
    payload.image = img;

    // Try to POST to /cart/add-custom (backend needs to support this). If not, try falling back to /cart/add with a menu id.
    fetch(`${API_URL}/cart/add-custom`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }).then(r=>{
        if (r.ok) return r.json().then(j=>({ok:true,data:j}));
        // fallback: attempt to send to /cart/add as best-effort (will likely fail unless backend supports it)
        return fetch(`${API_URL}/cart/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: 1, quantity: qty }) })
            .then(r2=> r2.ok ? r2.json().then(j=>({ok:true,data:j})) : ({ok:false}));
    }).then(result=>{
        const msg = document.getElementById('builder-msg');
        if (result && result.ok) {
            msg.textContent = 'Added to cart';
            // small success pulse on preview
            const preview = document.getElementById('preview');
            if (preview){ preview.classList.remove('pulse'); void preview.offsetWidth; preview.classList.add('pulse'); }
            // update main page cart if open in other tab
            setTimeout(()=>{ if (window.opener && window.opener.loadCart) window.opener.loadCart(); },200);
        } else {
            msg.textContent = 'Could not add to cart (backend may need /cart/add-custom).';
        }
    }).catch(err=>{
        const msg = document.getElementById('builder-msg');
        msg.textContent = 'Network error';
    });
}

document.addEventListener('DOMContentLoaded', renderBuilder);
