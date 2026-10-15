# ShopKart: Full-Stack E-Commerce (MERN)

A full-stack shopping app with authentication, product catalogue, wishlist, cart and Razorpay (test mode) checkout.

## Features
- Register / login with JWT stored in an HttpOnly cookie (bcrypt-hashed passwords)
- Product catalogue with search, category filter and sorting
- Wishlist (add, view, remove), stored in MongoDB
- Cart with quantity controls, stock validation and global state (Context API)
- Checkout with shipping form validation
- Razorpay test-mode payment with server-side signature verification
- Orders with price snapshot and My Orders page

## Tech Stack
React (Vite), React Router, Axios, Context API, Node.js, Express, MongoDB, Mongoose, bcrypt, jsonwebtoken, cookie-parser, Razorpay

## Project Structure
```
shopcart/
├── backend/   (controllers, models, routes, middlewares, utils, config, index.js)
└── frontend/  (src/pages, components, context, services)
```

## Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- Razorpay account in **Test Mode** (for API keys)

### 1. Clone
```bash
git clone https://github.com/sovmya/shopkart.git
cd shopkart
```

### 2. Backend
```bash
cd backend
npm install
```
Create `backend/.env` (see `.env.example`):
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```
Run:
```bash
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 4. Add sample products
Use Postman (or any API client) to `POST http://localhost:5000/products`:
```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard with blue switches.",
  "price": 2999,
  "category": "Electronics",
  "image": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef",
  "stock": 10
}
```

### Razorpay test payment
- Card: `4111 1111 1111 1111`, any future expiry, any CVV
- Bank: success: `SUCCESS` button, failure: `FAILURE` button

## API Overview

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /customers/register | No | Register |
| POST | /customers/login | No | Login (sets cookie) |
| GET | /customers/me | Yes | Current user |
| POST | /customers/logout | Yes | Logout |
| PATCH | /customers/change-password | Yes | Change password |
| POST | /products | No | Create product |
| GET | /products | No | List (search, category, sort) |
| GET | /products/:id | No | Single product |
| GET / POST / DELETE | /wishlist, /wishlist/:productId | Yes | Wishlist |
| GET / POST / PATCH / DELETE | /cart, /cart/:productId | Yes | Cart |
| POST | /orders/create-payment-order | Yes | Validate cart, create order + Razorpay order |
| POST | /orders/verify-payment | Yes | Verify signature, mark paid, clear cart |
| GET | /orders, /orders/:id | Yes | Order history |

## Security Notes
- Passwords stored as bcrypt hashes and never returned by the API
- JWT in an HttpOnly cookie
- Totals and stock are re-validated on the server; client prices are ignored
- Payments are confirmed only after HMAC signature verification
- Secrets live in `.env`, which is not committed