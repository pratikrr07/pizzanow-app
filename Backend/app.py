from flask import Flask, jsonify, request
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Sample menu data
menu = [
    {
        "id": 1,
        "name": "Pepperoni Pizza",
        "price": 16.99,
        "image": "pepperoni.jpg"
    },
    {
        "id": 2,
        "name": "Margherita Pizza",
        "price": 15.99,
        "image": "margherita.jpg"
    },
    {
        "id": 3,
        "name": "Veggie Pizza",
        "price": 14.99,
        "image": "veggie.jpg"
    },
    {
        "id": 4,
        "name": "Hawaiian Pizza",
        "price": 17.49,
        "image": "hawaiian.jpg"
    },
    {
        "id": 5,
        "name": "Cheese Pizza",
        "price": 13.99,
        "image": "cheese.jpg"
    }
]



# In-memory cart
cart = []

@app.route("/")
def home():
    return "Food Ordering API is running!"

@app.route("/menu", methods=["GET"])
def get_menu():
    return jsonify(menu)

@app.route("/cart", methods=["GET"])
def get_cart():
    total = sum(item["price"] * item["quantity"] for item in cart)
    return jsonify({
        "cart": cart,
        "total_price": round(total, 2)
    })

@app.route("/cart/add", methods=["POST"])
def add_to_cart():
    data = request.get_json()
    item_id = data.get("item_id")
    quantity = int(data.get("quantity", 1) or 1)
    # accept numeric ids sent as strings
    try:
        if isinstance(item_id, str) and item_id.isdigit():
            item_id = int(item_id)
    except Exception:
        pass

    item = next((i for i in menu if i["id"] == item_id), None)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    for cart_item in cart:
        # compare by string so UUIDs and numeric ids compare consistently
        if str(cart_item.get("id")) == str(item_id):
            cart_item["quantity"] += quantity
            # ensure image persists
            cart_item.setdefault('image', item.get('image'))
            return jsonify({"message": "Quantity updated"}), 200

    cart.append({
        "id": item["id"],
        "name": item["name"],
        "price": item["price"],
        "quantity": quantity,
        "image": item.get('image')
    })

    return jsonify({"message": "Item added to cart"}), 201


@app.route('/cart/add-custom', methods=['POST'])
def add_custom_to_cart():
    """Accepts a custom pizza payload and adds it to the in-memory cart.

    Expected payload example:
    {
      "custom": true,
      "name": "Build: medium / stuffed / pepperoni,olives",
      "price": 14.99,
      "quantity": 1,
      "meta": {"size":"medium","crust":"stuffed","toppings":["pepperoni","olives"]}
    }
    """
    data = request.get_json() or {}
    name = data.get('name', 'Custom Pizza')
    try:
        price = float(data.get('price', 0) or 0)
    except Exception:
        price = 0.0
    quantity = int(data.get('quantity', 1) or 1)
    meta = data.get('meta', {})
    # prefer an explicit image field from client; otherwise infer from toppings/name
    image = data.get('image')
    if not image:
        toppings = meta.get('toppings', []) if isinstance(meta, dict) else []
        key = (name or '').lower()
        if 'pineapple' in toppings or 'pineapple' in key or 'hawai' in key:
            image = 'hawaiian.jpg'
        elif 'pepperoni' in toppings or 'pepper' in key:
            image = 'pepperoni.jpg'
        elif 'extra_cheese' in toppings or 'cheese' in key:
            image = 'cheese.jpg'
        else:
            image = 'build.jpg'

    # Try to merge with an existing identical custom item (match by meta and price/name)
    for cart_item in cart:
        if cart_item.get('custom') and cart_item.get('meta') == meta and cart_item.get('price') == price and cart_item.get('name') == name:
            cart_item['quantity'] += quantity
            # ensure image is set on merged item
            cart_item.setdefault('image', image)
            return jsonify({'message': 'Quantity updated', 'item': cart_item}), 200

    item_id = str(uuid.uuid4())
    new_item = {
        'id': item_id,
        'name': name,
        'price': price,
        'quantity': quantity,
        'custom': True,
        'meta': meta,
        'image': image
    }
    cart.append(new_item)
    return jsonify({'message': 'Custom item added', 'item': new_item}), 201


@app.route("/cart/remove", methods=["POST"])
def remove_from_cart():
    data = request.get_json()
    item_id = data.get("item_id")
    dec = int(data.get('quantity', 1) or 1)

    for cart_item in cart:
        if str(cart_item.get("id")) == str(item_id):
            cart_item["quantity"] -= dec
            if cart_item["quantity"] <= 0:
                cart.remove(cart_item)
            return jsonify({"message": "Item updated"}), 200

    return jsonify({"error": "Item not in cart"}), 404

@app.route("/checkout", methods=["POST"])
def checkout():
    if not cart:
        return jsonify({"error": "Cart is empty"}), 400

    subtotal = sum(item["price"] * item["quantity"] for item in cart)
    tax = round(subtotal * 0.18, 2)
    total = round(subtotal + tax, 2)

    cart.clear()  # clear cart after order

    return jsonify({
        "message": "Order placed successfully!",
        "subtotal": round(subtotal, 2),
        "tax": tax,
        "total_paid": total
    })




if __name__ == "__main__":
    app.run(debug=True)
