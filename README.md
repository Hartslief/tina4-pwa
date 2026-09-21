# Tina4 Shop — Ecommerce PWA

A simple ecommerce Progressive Web App built as an onboarding project using **Tina4 Python** for the backend and **Tina4JS** for the frontend.

The application demonstrates a complete basic ecommerce flow:

* Browse products
* Register and log in
* Add products to a shopping cart
* View and manage the cart
* Checkout
* Generate an invoice
* View an invoice
* Admin product management
* Admin user management
* JWT authentication
* Progressive Web App installation and offline support

---

## Tech Stack

### Frontend

* [Tina4JS](https://tina4.com/)
* TypeScript
* Vite
* HTML/CSS
* Tina4JS signals and computed state
* Progressive Web App APIs

### Backend

* Tina4 Python
* Python
* SQLite
* Tina4 ORM
* JWT authentication
* REST API

---

## Project Structure

```text
tina4-pwa-project/
│
├── backend/
│   ├── src/
│   │   ├── orm/
│   │   └── routes/
│   ├── migrations/
│   └── ...
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin-product-form.ts
    │   │   ├── admin-user-form.ts
    │   │   ├── navigation.ts
    │   │   └── product-card.ts
    │   │
    │   ├── pages/
    │   │   ├── home.ts
    │   │   ├── products.ts
    │   │   ├── cart.ts
    │   │   ├── login.ts
    │   │   ├── register.ts
    │   │   ├── invoice.ts
    │   │   ├── admin.ts
    │   │   ├── admin-product-new.ts
    │   │   ├── admin-product-edit.ts
    │   │   └── admin-user-edit.ts
    │   │
    │   ├── routes/
    │   ├── services/
    │   ├── store.ts
    │   └── main.ts
    │
    ├── public/
    │   ├── css/
    │   ├── offline.html
    │   └── Icon_Bird_512x512.png
    │
    └── vite.config.ts
```

---

# Features

## Product Catalogue

Users can browse products through the public product API.

Each product contains:

* Name
* Description
* Price
* Stock status

Products are displayed using reusable Tina4JS product card components.

---

## Authentication

The application uses JWT-based authentication.

Users can:

* Register an account
* Log in
* Stay authenticated across page refreshes
* Log out
* Retrieve their current profile

Passwords are hashed on the backend before being stored.

The JWT contains information about the authenticated user, including their:

* User ID
* Email
* Role

### Roles

The application currently supports two roles:

```text
user
admin
```

Regular users can shop and checkout.

Administrators can access the admin dashboard.

---

# Shopping Cart

Each authenticated user has their own server-side shopping cart.

The cart is stored in the backend database using:

```text
Cart
CartItem
Product
```

The frontend communicates with the backend through the cart API.

The cart supports:

* Adding products
* Adding additional quantities of an existing product
* Removing products
* Calculating item totals
* Calculating the cart total

The frontend uses Tina4JS reactive state so that cart-related UI can respond when cart data changes.

---

# Checkout

The checkout process is intentionally simple for this project.

```text
Cart
  ↓
Checkout
  ↓
Invoice
  ↓
Invoice Items
```

When the user checks out:

1. The active cart is retrieved.
2. Cart items are validated.
3. Product prices are read from the database.
4. The invoice total is calculated.
5. An invoice is created.
6. Invoice items are created.
7. The cart is marked as completed.
8. The generated invoice is returned to the frontend.

There is currently no payment gateway integration.

---

# Invoices

After checkout, the user receives an invoice.

An invoice contains:

* Invoice ID
* User ID
* Cart ID
* Total
* Status
* Invoice items

Users can retrieve their own invoices through the API.

The backend checks the authenticated user before returning an invoice, preventing one user from accessing another user's invoice.

---

# Admin Dashboard

Administrators have access to:

```text
/admin
```

The dashboard provides management of:

### Products

Administrators can:

* View products
* Create products
* Edit products
* Delete products
* Change stock availability

### Users

Administrators can:

* View users
* Change user roles
* Change email addresses
* Delete users

An administrator cannot delete their own account.

Admin endpoints are protected using Tina4's role-based authorization.

---

# API

The frontend communicates with the backend through `/api`.

Vite proxies these requests to the Tina4 Python backend:

```text
Frontend
http://localhost:5173

        ↓ /api

Backend
http://localhost:7146
```

## Public Products

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| GET    | `/api/products`      | List products |
| GET    | `/api/products/{id}` | Get a product |

---

## Authentication

| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| POST   | `/api/auth/register` | Register a user            |
| POST   | `/api/auth/login`    | Login and receive a JWT    |
| GET    | `/api/auth/me`       | Get the authenticated user |

Authenticated requests use:

```text
Authorization: Bearer <token>
```

---

## Cart

| Method | Endpoint               | Description                 |
| ------ | ---------------------- | --------------------------- |
| GET    | `/api/cart`            | Get the current user's cart |
| POST   | `/api/cart/items`      | Add a product to the cart   |
| DELETE | `/api/cart/items/{id}` | Remove a cart item          |

---

## Checkout & Invoices

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | `/api/checkout`      | Checkout the active cart |
| GET    | `/api/invoices/{id}` | Retrieve an invoice      |

---

## Admin

Admin endpoints require the `admin` role.

### Products

| Method | Endpoint                   | Description       |
| ------ | -------------------------- | ----------------- |
| GET    | `/api/admin/products`      | List all products |
| POST   | `/api/admin/products`      | Create a product  |
| PUT    | `/api/admin/products/{id}` | Update a product  |
| DELETE | `/api/admin/products/{id}` | Delete a product  |

### Users

| Method | Endpoint                | Description   |
| ------ | ----------------------- | ------------- |
| GET    | `/api/admin/users`      | List users    |
| PUT    | `/api/admin/users/{id}` | Update a user |
| DELETE | `/api/admin/users/{id}` | Delete a user |

---

# Frontend Architecture

The frontend is separated into three main areas.

## Pages

Pages are responsible for composing the UI for a particular route.

```text
pages/
├── home.ts
├── products.ts
├── cart.ts
├── login.ts
├── register.ts
├── invoice.ts
└── admin.ts
```

## Components

Reusable UI elements are placed in:

```text
components/
```

For example:

```text
product-card.ts
navigation.ts
admin-product-form.ts
admin-user-form.ts
```

This keeps reusable UI separate from page-specific logic.

## Services

API communication is separated into service modules:

```text
services/
├── auth-api.ts
├── product-api.ts
├── cart-api.ts
├── checkout-api.ts
├── invoice-api.ts
└── admin-api.ts
```

Pages and components therefore do not need to contain the API request implementation themselves.

---

# Reactive State

Tina4JS signals are used for shared frontend state.

For example, authentication state is stored centrally:

```text
store.ts
│
├── token
├── user
├── isLoggedIn
└── isAdmin
```

Computed values derive information from that state.

This allows components such as the navigation bar to react automatically when authentication state changes.

The same approach can be used for shared cart state, allowing the cart count and other UI elements to stay synchronized.

---

# Progressive Web App

The application is configured as a Progressive Web App using Tina4JS.

The PWA configuration provides:

* Web app manifest
* Installable application
* Service worker
* Cached resources
* Offline route
* Standalone display mode
* Application theme information

The application registers the PWA using:

```typescript
pwa.register({
    name: "Tina4 Shop",
    shortName: "Tina4 Shop",
    themeColor: "#1e1e2e",
    backgroundColor: "#1e1e2e",
    display: "standalone",
    icon: "/Icon_Bird_512x512.png",
    cacheStrategy: "stale-while-revalidate",
    precache: [
        "/",
        "/Icon_Bird_512x512.png",
        "/offline.html",
    ],
    offlineRoute: "/offline.html",
});
```

The PWA allows the frontend application and cached resources to remain available when the network is unavailable.

Backend operations such as:

* Login
* Adding items to the cart
* Checkout
* Admin operations

still require communication with the backend.

---

# Running the Project

## Backend

Open a terminal in the backend directory:

```powershell
cd backend
```

Run database migrations:

```powershell
tina4 migrate
```

Start the backend:

```powershell
tina4 serve
```

The backend runs on:

```text
http://localhost:7146
```

---

## Frontend

Open another terminal:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
tina4 serve
```

The frontend runs on:

```text
http://localhost:5173
```

Open the application in a browser:

```text
http://localhost:5173
```

---

# API Documentation

Swagger documentation is available from the Tina4 backend.

Once the backend is running, open:

```text
http://localhost:7146/swagger
```

The Swagger UI provides interactive documentation for the API and allows endpoints to be tested directly from the browser.

---

# Testing

The frontend uses Vitest for unit testing.

Tests can be run with:

```powershell
npm run test
```

The project includes tests for Tina4JS reactive state such as signals and computed values.

Example:

```typescript
const count = signal(1);

expect(count.value).toBe(1);

count.value = 5;

expect(count.value).toBe(5);
```

Testing can be expanded to cover:

* Authentication state
* Cart state
* API services
* Product components
* Admin functionality
* Checkout behavior

---

# Development Notes

## API Proxy

During development, Vite proxies `/api` requests to the Tina4 backend.

```text
/api/*
    ↓
http://localhost:7146
```

This allows frontend code to use:

```typescript
api.get("/products");
```

instead of directly specifying the backend URL.

---

## Route Registration

Routes and components are automatically loaded by `main.ts` using Vite's eager glob imports.

```typescript
import.meta.glob(
    "./routes/**/*.ts",
    { eager: true },
);

import.meta.glob(
    "./components/**/*.ts",
    { eager: true },
);
```

This means adding a new route file to the routes directory automatically registers it when the application starts.

---

# Database

The project currently uses SQLite for simplicity.

The main entities are:

```text
User
 │
 └── Cart
      │
      └── CartItem
           │
           └── Product

Cart
 │
 └── Invoice
      │
      └── InvoiceItem
```

This provides the basic relationships required for the ecommerce workflow.

---

# Current Scope

This project intentionally keeps the ecommerce implementation simple.

Included:

* Product catalogue
* User accounts
* JWT authentication
* Shopping cart
* Checkout
* Invoices
* Admin management
* PWA functionality
* REST API
* Swagger documentation

Not currently included:

* Payment gateway
* Shipping integration
* Order tracking
* Product images uploaded through the admin panel
* Product categories
* Product reviews
* Email notifications
* Production deployment configuration

These could be added later if the application were expanded into a production ecommerce platform.

---

# Project Goal

The goal of this project is to demonstrate how a modern web application can combine:

```text
Tina4 Python
      +
Tina4JS
      +
REST API
      +
SQLite
      +
JWT Authentication
      +
Reactive Frontend State
      +
Progressive Web App
```

into a complete, small-scale ecommerce application.
