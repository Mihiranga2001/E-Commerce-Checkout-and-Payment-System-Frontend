# E-Commerce Checkout & Payment System - Frontend

Frontend application for the E-Commerce Checkout & Payment System. This React application provides user interfaces for authentication, product browsing, shopping cart management, checkout processing, payment workflow, and order tracking.

## Technology Stack

- React.js
- Vite
- Tailwind CSS
- Axios
- React Router
- React Icons
- React Hot Toast
- Vercel Deployment

## Features

### Authentication

- User registration and login
- JWT token-based authentication
- User session management
- Protected routes
- Role-based user access

### Product Management

- Browse available products
- View product details
- Display product images
- Product availability checking
- Product selection for checkout

### Shopping Cart Management

- Add products to cart
- Update cart quantities
- Remove products from cart
- Cart item management
- Order summary calculation

### Checkout System

- Checkout process
- Customer order confirmation
- Payment workflow interface
- Order creation process
- Checkout validation

### Payment Management

- Payment process handling
- Payment status display
- Payment confirmation flow
- Transaction status updates

### Order Management

- View customer orders
- Track order status
- Order history display
- Order details viewing

### User Interface

- Responsive user interface
- Reusable React components
- Loading states
- Error handling
- Toast notifications
- Navigation system

## Project Structure

```
frontend

├── src
│
├── components
│
├── pages
│
├── routes
│
├── utils
│
├── assets
│
├── App.jsx
│
└── main.jsx
```

## Environment Variables

```env
VITE_BACKEND_URL=
```

## Installation

```bash
npm install
```

## Running Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

## API Integration

- `/api/users` - Authentication and user management

- `/api/products` - Product information and availability

- `/api/cart` - Shopping cart management

- `/api/orders` - Order creation and tracking

- `/api/payments` - Payment processing

## Deployment

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

Storage: Supabase Storage

## Author

Gaurawa Mihiranga
