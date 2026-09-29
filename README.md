# FoodieExpress 🍔🛵

FoodieExpress is a modern, responsive, full-stack food delivery application featuring secure user-isolated token authorization, live animated order tracking, synchronized cross-page carts, and seamless integration with a Spring Boot REST API.

---

## 🌟 Key Features & Updates

### 1. 🔒 User-Isolated Authentication & Authorization (JWT Tokens)
- **Private Sessions**: Every user account operates in a secure, isolated sandbox. User A can never view, track, or cancel User B's orders or cart.
- **JWT & Bearer Tokens**: Authenticated endpoints (`/api/orders/my`, `POST /api/orders`, `PATCH /api/orders/{id}/cancel`) enforce token validation via `Authorization: Bearer <token>` to prevent account spoofing.
- **Multi-User Demo Switcher**: Instant 1-click account switching between demo accounts right from the sidebar:
  - **Alex Smith** (`alex@email.com` / `password123`): Active orders from *Crust & Craft* and *Wok This Way*.
  - **Priya Sharma** (`priya@email.com` / `password123`): Dedicated order from *Green Theory*.
  - **New Registered Users**: Start with fresh, completely isolated order histories and private carts.

### 2. 🛵 Interactive Live Order Tracking Timeline
- **Live Animated Route Map**: Dynamic SVG route visualizer showing the restaurant kitchen, animated courier delivery scooter riding in real-time, and customer destination pin.
- **Dynamic ETA Countdown**: Active countdown timer displaying live minutes and seconds remaining until arrival.
- **Stage-by-Stage Progression**: Visual status indicators with pulsing active rings:
  1. `Placed` ➔ 2. `Confirmed` ➔ 3. `Preparing` ➔ 4. `Out for delivery` ➔ 5. `Delivered`
- **Delivery Partner Info**: Rider card with driver details ("Ramesh Kumar", 4.9 ★, vehicle registration, and interactive Call / Chat action buttons).
- **Order Cancellation**: Active orders can be cancelled with instantaneous status updates.

### 3. 🛍️ Unified Cart & Dedicated Checkout (`checkout.html`)
- **Cross-Page Synchronization**: Carts are scoped per user and synchronized seamlessly across [index.html](file:///c:/Users/MADHAN%20SRI%20SAI/OneDrive/Desktop/food_app/frontend/index.html), [menu.html](file:///c:/Users/MADHAN%20SRI%20SAI/OneDrive/Desktop/food_app/frontend/menu.html), [restaurant.html](file:///c:/Users/MADHAN%20SRI%20SAI/OneDrive/Desktop/food_app/frontend/restaurant.html), and [checkout.html](file:///c:/Users/MADHAN%20SRI%20SAI/OneDrive/Desktop/food_app/frontend/checkout.html).
- **Interactive Discount Coupons**:
  - `WELCOME30`: 30% discount on order subtotal (up to ₹150)
  - `FOODIE20`: 20% discount on order subtotal (up to ₹100)
  - `FREEDEL`: Waives delivery fee (saves ₹39)
- **Payment Options**: Supports UPI / QR scan (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Cash on Delivery.

### 4. ⚡ Intelligent Dual-Mode Engine (Live REST API + Offline Fallback)
- **Live Spring Boot Connection**: Automatically detects if the backend is running at `http://localhost:8080/api` and displays `🟢 REST API Online (8080)` in the topbar.
- **Offline / Standalone Fallback**: If the backend is stopped, the application gracefully falls back to local isolated storage without throwing network errors or breaking the UI (`⚡ Offline Demo Mode`).

---

## 🚀 How to Run

### Option 1: Frontend (Fastest Prototype)
1. Open the project folder in VS Code.
2. Open [frontend/index.html](file:///c:/Users/MADHAN%20SRI%20SAI/OneDrive/Desktop/food_app/frontend/index.html).
3. Right-click and select **Open with Live Server** (or open directly in any browser).

### Option 2: Full-Stack (Backend + Frontend)
1. **Start the Spring Boot Backend**:
   - Double-click [run-backend.bat](file:///c:/Users/MADHAN%20SRI%20SAI/OneDrive/Desktop/food_app/run-backend.bat) (or run `./run-backend.ps1` in PowerShell).
   - Alternatively, from the project root run:
     ```powershell
     mvn spring-boot:run -Dspring-boot.run.profiles=dev
     ```
   - The backend will start on **http://localhost:8080** using the zero-setup H2 in-memory database with pre-seeded restaurants, food items, and users.
   - For MySQL, simply configure credentials in [src/main/resources/application.properties](file:///c:/Users/MADHAN%20SRI%20SAI/OneDrive/Desktop/food_app/src/main/resources/application.properties).

2. **Open Frontend**:
   - Open [frontend/index.html](file:///c:/Users/MADHAN%20SRI%20SAI/OneDrive/Desktop/food_app/frontend/index.html) in your browser.
   - The topbar indicator will display **🟢 REST API Online (8080)**.

---

## 📁 Project Directory Structure

```text
food_app/
├── frontend/
│   ├── index.html            # Main home page with restaurants, categories, cart & live tracker
│   ├── checkout.html         # Dedicated checkout page with address & coupons
│   ├── menu.html             # 1,008-item searchable menu catalog with pagination
│   ├── restaurant.html       # Individual restaurant view with dynamic menus & reviews
│   ├── login.html            # Authentication page with demo user selector
│   ├── register.html         # User registration with session initialization
│   ├── css/
│   │   ├── style.css         # Complete design system tokens, tracker, and animations
│   │   └── landing.css       # Landing page styling
│   └── js/
│       ├── api.js            # REST API client, JWT session handling, & isolated storage
│       ├── app.js            # Home page interactions, live order tracking, & modals
│       ├── auth.js           # Login & register form controller
│       ├── food-data.js      # Structured catalog data (42 restaurants, 1,008 items)
│       └── menu.js           # Menu catalog filtering & pagination
├── src/main/java/com/bitedash/
│   ├── FoodAppApplication.java
│   ├── config/               # CorsConfig, DataInitializer
│   ├── controller/           # AuthController, OrderController, RestaurantController, ReviewController
│   ├── dto/                  # Request/Response records with JWT tokens
│   ├── entity/               # User, Restaurant, FoodItem, Order, OrderItem, Review
│   ├── repository/           # Spring Data JPA repositories
│   └── service/              # AuthService, JwtService, OrderService, RestaurantService
├── run-backend.bat           # One-click Windows batch launcher
├── run-backend.ps1           # One-click PowerShell launcher
├── pom.xml                   # Maven dependencies (Spring Boot, H2, MySQL, Security)
└── README.md
```
