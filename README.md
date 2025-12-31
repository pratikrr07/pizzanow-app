# PizzaNow — Simple Food Ordering Demo

This repository contains a small food-ordering demo: a Flask backend API and a static frontend (HTML/CSS/JS).

Features
- Menu browsing with images
- Cart sidebar with add/remove and quantities
- Checkout (subtotal, tax, total)
- Build-Your-Own pizza flow (custom pizza payloads stored in cart)

Project layout
- `app.py` — Flask backend API (endpoints: `/menu`, `/cart`, `/cart/add`, `/cart/remove`, `/cart/add-custom`, `/checkout`)
- `index.html` — Main menu + cart sidebar
- `build.html` — Build-Your-Own pizza UI
- `checkout.html` — Checkout page
- `script.js`, `build.js`, `checkout.js` — Frontend logic
- `style.css` — Styles
- `images/` — Image assets

Requirements
- Python 3.8+
- See `requirements.txt` for Python packages

Quickstart
1. Install Python dependencies

```bash
python3 -m pip install -r requirements.txt
```

2. Start the backend API (runs on port 5000)

```bash
python3 app.py
```

3. Serve the frontend (optional — you can open HTML files directly in a browser). To serve via a simple HTTP server:

```bash
# from the Frontend directory
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html` in your browser.

Running the frontend with Live Server (VS Code)
- If you use Visual Studio Code, you can install the "Live Server" extension to serve the frontend with auto-reload.
- Open the `Frontend` folder in VS Code, right-click `index.html` and choose "Open with Live Server". This will open the app at `http://127.0.0.1:5500` (or another port) and reload when you edit files.

Notes
- The frontend scripts expect the API at `http://127.0.0.1:5000`. If you change the backend port or host, update `API_URL` in `script.js`, `build.js`, and `checkout.js`.
- The cart is in-memory (not persistent). Restarting the backend will clear the cart.

Extending the project
- Persist cart to disk or a database
- Add `/cart/update` and `/cart/clear` endpoints
- Add user accounts and order history
- Add payment integration for real checkout

License
- This demo is provided as-is for learning and prototyping.
