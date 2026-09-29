# 🍔 FoodieExpress

**FoodieExpress** is a modern, responsive, full-stack food delivery application built with a JavaScript frontend and a Spring Boot REST API.

The application provides secure JWT-based authentication, user-isolated carts and orders, live animated order tracking, restaurant and menu browsing, checkout, coupons, multiple payment options, and an offline fallback mode.

---

## 🌟 Features

### 🔐 1. Authentication & Authorization

* Secure user registration and login
* JWT-based authentication
* Bearer token authorization
* User-isolated sessions
* Each user has a private cart and order history
* Users cannot access another user's orders or cart
* Protected order APIs
* Demo account switching for testing

### 🛵 2. Live Order Tracking

FoodieExpress provides an interactive order tracking experience.

#### Order Stages

```text
Placed
  ↓
Confirmed
  ↓
Preparing
  ↓
Out for Delivery
  ↓
Delivered
```

Features include:

* 🗺️ Animated delivery route
* 🛵 Animated courier tracking
* 📍 Restaurant and customer locations
* ⏱️ Dynamic ETA countdown
* 🔄 Live order status progression
* 👨‍💼 Delivery partner information
* 📞 Call and chat actions
* ❌ Order cancellation

---

## 🛒 3. Cart & Checkout

The application includes a unified shopping cart synchronized across multiple pages.

### Cart Features

* User-specific cart
* Cross-page cart synchronization
* Add/remove food items
* Quantity management
* Automatic price calculation
* Checkout page
* Delivery fee calculation
* Discount coupon support

### 🎟️ Available Coupons

| Coupon      | Discount            |
| ----------- | ------------------- |
| `WELCOME30` | 30% off, up to ₹150 |
| `FOODIE20`  | 20% off, up to ₹100 |
| `FREEDEL`   | Free delivery       |

---

## 💳 4. Payment Options

FoodieExpress supports multiple payment methods:

* 📱 UPI
* 🔳 QR Code
* 💳 Credit/Debit Card
* 💵 Cash on Delivery

---

## ⚡ 5. Dual-Mode Application

FoodieExpress can work in two modes.

### 🟢 Live REST API Mode

When the Spring Boot backend is running:

```text
http://localhost:8080/api
```

The frontend connects to the backend and displays:

```text
🟢 REST API Online (8080)
```

### ⚡ Offline Demo Mode

If the backend is unavailable, the application automatically switches to local storage.

```text
⚡ Offline Demo Mode
```

This allows the frontend to continue working without requiring the backend.

---

# 🏗️ Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* Responsive Web Design
* SVG Animations
* REST API Integration
* Local Storage

## Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* REST APIs
* JWT Authentication
* Maven

## Database

* H2 Database
* MySQL

## Development Tools

* VS Code
* Git
* GitHub
* Maven
* Spring Boot

---

# 📁 Project Structure

```text
food_app/
│
├── frontend/
│   ├── index.html
│   ├── checkout.html
│   ├── menu.html
│   ├── restaurant.html
│   ├── login.html
│   ├── register.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   └── landing.css
│   │
│   └── js/
│       ├── api.js
│       ├── app.js
│       ├── auth.js
│       ├── food-data.js
│       └── menu.js
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── bitedash/
│       │           ├── FoodAppApplication.java
│       │           │
│       │           ├── config/
│       │           ├── controller/
│       │           ├── dto/
│       │           ├── entity/
│       │           ├── repository/
│       │           └── service/
│       │
│       └── resources/
│           └── application.properties
│
├── run-backend.bat
├── run-backend.ps1
├── pom.xml
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Java JDK
* Maven
* VS Code
* Git
* A modern web browser

---

## ▶️ Option 1: Run Frontend Only

This is the easiest way to try the application.

### Step 1

Clone the repository:

```bash
git clone https://github.com/madhansrisaimamidi-star/food-app-by-madhan.git
```

### Step 2

Open the project in VS Code:

```bash
cd food-app-by-madhan
```

### Step 3

Open:

```text
frontend/index.html
```

You can use the **Live Server** extension in VS Code.

The application will run in offline/demo mode if the backend is not available.

---

# 🖥️ Option 2: Run Full-Stack Application

## Step 1 — Start Backend

From the project root:

### Windows

You can run:

```text
run-backend.bat
```

or use PowerShell:

```powershell
./run-backend.ps1
```

You can also run:

```powershell
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The backend will start at:

```text
http://localhost:8080
```

API base URL:

```text
http://localhost:8080/api
```

---

## Step 2 — Start Frontend

Open:

```text
frontend/index.html
```

using VS Code Live Server.

When the backend is running, the application should detect the API automatically.

You should see:

```text
🟢 REST API Online (8080)
```

---

# 🔑 Demo Accounts

For demonstration purposes, the application provides demo accounts.

### Alex Smith

```text
Email: alex@email.com
Password: password123
```

### Priya Sharma

```text
Email: priya@email.com
Password: password123
```

Each account has its own isolated cart and order history.

> For production deployment, demo credentials should be removed and passwords should never be stored or exposed in source code.

---

# 🔌 REST API

The Spring Boot backend provides REST endpoints for authentication, restaurants, orders, and reviews.

Example protected endpoints:

```text
GET    /api/orders/my
POST   /api/orders
PATCH  /api/orders/{id}/cancel
```

Authenticated requests use:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 🔒 Security

FoodieExpress uses JWT-based authentication to protect authenticated resources.

The application follows a user-isolation approach where:

```text
User A
 ├── Private Cart
 └── Private Orders

User B
 ├── Private Cart
 └── Private Orders
```

A user cannot use their session to access another user's private order information.

---

# 📊 Application Architecture

```text
                 ┌─────────────────────┐
                 │      Frontend       │
                 │ HTML/CSS/JavaScript │
                 └──────────┬──────────┘
                            │
                            │ REST API
                            ↓
                 ┌─────────────────────┐
                 │    Spring Boot     │
                 │      Backend       │
                 └──────────┬──────────┘
                            │
                 ┌──────────┴──────────┐
                 ↓                     ↓
          ┌─────────────┐       ┌─────────────┐
          │     H2      │       │    MySQL    │
          │  Database   │       │  Database   │
          └─────────────┘       └─────────────┘
```

Offline mode:

```text
Frontend
   │
   └── Local Storage
         │
         └── Offline Demo Mode
```

---

# 📱 Main Pages

| Page              | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `index.html`      | Home page, restaurants, categories, cart and tracking |
| `menu.html`       | Searchable food menu                                  |
| `restaurant.html` | Restaurant details and menu                           |
| `checkout.html`   | Checkout, address, coupons and payment                |
| `login.html`      | User authentication                                   |
| `register.html`   | New user registration                                 |

---

# 🔮 Future Improvements

Possible future enhancements include:

* 🌐 Deploy frontend and backend online
* 📍 Real-time GPS delivery tracking
* 🔔 Push notifications
* 💳 Real payment gateway integration
* 🗺️ Google Maps/Mapbox integration
* ⭐ Restaurant and food ratings
* 💬 Real-time customer support
* 📦 Advanced order management
* 👨‍🍳 Restaurant owner dashboard
* 🚴 Delivery partner dashboard
* 📊 Admin dashboard
* ☁️ Cloud database integration
* 🔐 Production-grade authentication and security

---

# 📸 Screenshots

Add screenshots of your application here:

```text
screenshots/
├── home.png
├── restaurant.png
├── menu.png
├── checkout.png
├── order-tracking.png
└── login.png
```

Example:

```markdown
![Home Page](screenshots/home.png)
```

---

# 🎯 Project Highlights

FoodieExpress demonstrates practical implementation of:

* Full-stack application development
* REST API development
* JWT authentication
* Authorization
* User data isolation
* Database integration
* Frontend-backend communication
* Cart management
* Checkout workflows
* Order lifecycle management
* Responsive UI development
* Offline fallback architecture

---

# 👨‍💻 Author

**Madhan Sri Sai Mamidi**

GitHub:
https://github.com/madhansrisaimamidi-star

Project Repository:
https://github.com/madhansrisaimamidi-star/food-app-by-madhan

---

# 📄 License

This project is developed for **educational, learning, and demonstration purposes**.
