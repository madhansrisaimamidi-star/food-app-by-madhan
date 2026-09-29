/**
 * FoodieExpress Unified API Client & Isolated Session Authorization Layer
 * Guarantees strict user isolation: each user has private tokens, private carts, and private order histories.
 */
(() => {
  const API_BASE = "http://localhost:8080/api";
  let isBackendOnline = false;

  // Demo accounts with isolated identities & initial histories
  const DEMO_ACCOUNTS = [
    {
      id: 1,
      name: "Alex Smith",
      email: "alex@email.com",
      role: "CUSTOMER",
      token: "demo_jwt_token_user_1_alex_smith_2026",
      phone: "+91 98765 43210",
      address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru",
      initialOrders: [
        {
          id: "FE-2048",
          numericId: 2048,
          userId: 1,
          name: "Crust & Craft",
          items: "Margherita Supreme × 2, Truffle Mushroom Pizza × 1",
          itemsList: [
            { name: "Margherita Supreme", qty: 2, price: 329 },
            { name: "Truffle Mushroom Pizza", qty: 1, price: 449 }
          ],
          total: "₹1,107",
          totalAmount: 1107,
          status: "Delivered",
          deliveryAddress: "Flat 402, Green Glen Layout, Bellandur, Bengaluru",
          date: "Today, 1:20 PM",
          orderedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          etaMinutes: 0,
          driver: { name: "Ramesh Kumar", phone: "+91 98765 12345", rating: "4.9", vehicle: "Yamaha Aerox • KA 01 EQ 4920" }
        },
        {
          id: "FE-2041",
          numericId: 2041,
          userId: 1,
          name: "Wok This Way",
          items: "Signature Hakka Noodles × 1, Schezwan Chilli Paneer × 1",
          itemsList: [
            { name: "Signature Hakka Noodles", qty: 1, price: 249 },
            { name: "Schezwan Chilli Paneer", qty: 1, price: 279 }
          ],
          total: "₹567",
          totalAmount: 567,
          status: "Delivered",
          deliveryAddress: "Flat 402, Green Glen Layout, Bellandur, Bengaluru",
          date: "Yesterday, 7:40 PM",
          orderedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          etaMinutes: 0,
          driver: { name: "Sunil Verma", phone: "+91 98765 88990", rating: "4.8", vehicle: "TVS NTorq • KA 03 HJ 1184" }
        }
      ]
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@email.com",
      role: "CUSTOMER",
      token: "demo_jwt_token_user_2_priya_sharma_2026",
      phone: "+91 91234 56789",
      address: "Villa 12, Palm Meadows, Whitefield, Bengaluru",
      initialOrders: [
        {
          id: "FE-3105",
          numericId: 3105,
          userId: 2,
          name: "Green Theory",
          items: "Avocado Quinoa Power Bowl × 2, Greek Salad × 1",
          itemsList: [
            { name: "Avocado Quinoa Power Bowl", qty: 2, price: 320 },
            { name: "Greek Mediterranean Salad", qty: 1, price: 280 }
          ],
          total: "₹959",
          totalAmount: 959,
          status: "Delivered",
          deliveryAddress: "Villa 12, Palm Meadows, Whitefield, Bengaluru",
          date: "Yesterday, 1:15 PM",
          orderedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
          etaMinutes: 0,
          driver: { name: "Anil Gowda", phone: "+91 98111 22334", rating: "5.0", vehicle: "Ather 450X • KA 04 EV 7712" }
        }
      ]
    }
  ];

  /* ── Probe Backend ──────────────────────────────────────────────── */
  async function probeBackend() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`${API_BASE}/restaurants`, { method: "GET", signal: controller.signal });
      clearTimeout(timeoutId);
      isBackendOnline = res.ok;
    } catch {
      isBackendOnline = false;
    }
    window.dispatchEvent(new CustomEvent("foodie-backend-status", { detail: { online: isBackendOnline } }));
    return isBackendOnline;
  }

  /* ── Current User & Token Session ───────────────────────────────── */
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem("foodieExpressUser");
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.id) return u;
      }
    } catch (e) {
      console.error(e);
    }
    // Default to Alex Smith if no session is set
    const defaultUser = DEMO_ACCOUNTS[0];
    localStorage.setItem("foodieExpressUser", JSON.stringify(defaultUser));
    return defaultUser;
  }

  function getAuthToken() {
    const user = getCurrentUser();
    return user ? user.token : null;
  }

  function setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem("foodieExpressUser");
    } else {
      localStorage.setItem("foodieExpressUser", JSON.stringify(user));
    }
    window.dispatchEvent(new CustomEvent("foodie-user-changed", { detail: user }));
    window.dispatchEvent(new CustomEvent("foodie-cart-updated", { detail: getCart() }));
    window.dispatchEvent(new CustomEvent("foodie-orders-updated", { detail: [] }));
  }

  function logout() {
    localStorage.removeItem("foodieExpressUser");
    window.dispatchEvent(new CustomEvent("foodie-user-changed", { detail: null }));
    window.location.href = "login.html";
  }

  function switchUser(userId) {
    const account = DEMO_ACCOUNTS.find(a => a.id === Number(userId));
    if (account) {
      setCurrentUser(account);
      return account;
    }
    return null;
  }

  async function login(email, password) {
    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          return { success: true, user };
        } else {
          const err = await res.json().catch(() => ({}));
          return { success: false, message: err.message || "Invalid credentials." };
        }
      } catch (e) {
        console.warn("Backend login failed, fallback to local login", e);
      }
    }

    // Check pre-registered accounts
    const registeredUsers = JSON.parse(localStorage.getItem("foodie_registered_users") || "[]");
    const found = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.password === password) {
        const user = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: "CUSTOMER",
          token: found.token || `jwt_token_${found.id}_${Date.now()}`
        };
        setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, message: "Invalid email or password." };
    }

    // Demo account match
    const demo = DEMO_ACCOUNTS.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (demo) {
      setCurrentUser(demo);
      return { success: true, user: demo };
    }

    // Create session for any valid demo credentials
    const name = email.split("@")[0].replace(/[\._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "User";
    const user = {
      id: Math.abs(email.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) || Date.now(),
      name,
      email,
      role: "CUSTOMER",
      token: `jwt_token_${Date.now()}`
    };
    setCurrentUser(user);
    return { success: true, user };
  }

  async function register(name, email, password) {
    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          return { success: true, user };
        } else {
          const err = await res.json().catch(() => ({}));
          return { success: false, message: err.message || "Registration failed." };
        }
      } catch (e) {
        console.warn("Backend register failed, fallback to local register", e);
      }
    }

    // Local fallback with user isolation
    const users = JSON.parse(localStorage.getItem("foodie_registered_users") || "[]");
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "An account with this email already exists." };
    }

    const newId = 1000 + users.length + 1;
    const token = `jwt_token_${newId}_${Date.now()}`;
    const newUser = { id: newId, name, email, password, token };
    users.push(newUser);
    localStorage.setItem("foodie_registered_users", JSON.stringify(users));

    const userProfile = { id: newId, name, email, role: "CUSTOMER", token };
    setCurrentUser(userProfile);
    return { success: true, user: userProfile };
  }

  /* ── User-Isolated Cart Management ──────────────────────────────── */
  function getCartKey() {
    const user = getCurrentUser();
    return `foodie_cart_${user ? user.id : 'guest'}`;
  }

  function getCart() {
    try {
      const data = localStorage.getItem(getCartKey());
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(getCartKey(), JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("foodie-cart-updated", { detail: items }));
  }

  function addToCart(item, qty = 1) {
    const cart = getCart();
    const existing = cart.find(x => x.name === item.name);
    if (existing) {
      existing.qty += qty;
    } else {
      const priceNum = typeof item.price === "number" ? item.price : (item.price === "₹" ? 199 : 299);
      cart.push({
        id: item.id || Date.now(),
        name: item.name,
        price: priceNum,
        emoji: item.emoji || "🍽️",
        category: item.category || "General",
        restaurant: item.restaurant || item.restaurantName || "FoodieExpress Partner",
        restaurantId: item.restaurantId || 1,
        qty: qty
      });
    }
    saveCart(cart);
    return cart;
  }

  function updateCartQty(itemName, delta) {
    let cart = getCart();
    const target = cart.find(x => x.name === itemName);
    if (target) {
      target.qty += delta;
      if (target.qty <= 0) {
        cart = cart.filter(x => x.name !== itemName);
      }
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(itemName) {
    let cart = getCart();
    cart = cart.filter(x => x.name !== itemName);
    saveCart(cart);
    return cart;
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartTotals(couponCode = null) {
    const items = getCart();
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    let deliveryFee = subtotal > 0 ? 39 : 0;
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const code = couponCode.toUpperCase().trim();
      if (code === "WELCOME30") {
        discount = Math.min(Math.round(subtotal * 0.3), 150);
        appliedCoupon = { code: "WELCOME30", label: "30% Welcome Discount (Max ₹150)" };
      } else if (code === "FOODIE20") {
        discount = Math.min(Math.round(subtotal * 0.2), 100);
        appliedCoupon = { code: "FOODIE20", label: "20% Foodie Savings (Max ₹100)" };
      } else if (code === "FREEDEL") {
        discount = deliveryFee;
        deliveryFee = 0;
        appliedCoupon = { code: "FREEDEL", label: "Free Delivery (Saved ₹39)" };
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    return { count, subtotal, deliveryFee, discount, total, appliedCoupon };
  }

  /* ── User-Isolated Orders & Authorization ────────────────────────── */
  function getOrdersKey() {
    const user = getCurrentUser();
    return `foodie_orders_${user ? user.id : 'guest'}`;
  }

  function getLocalUserOrders() {
    const user = getCurrentUser();
    const key = getOrdersKey();
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}

    // Check if initial orders exist for known demo account
    const demo = DEMO_ACCOUNTS.find(d => d.id === user.id);
    const initial = demo ? demo.initialOrders : [];
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }

  function saveLocalUserOrders(orders) {
    localStorage.setItem(getOrdersKey(), JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent("foodie-orders-updated", { detail: orders }));
  }

  async function getOrders() {
    const user = getCurrentUser();
    if (!user) return [];

    if (isBackendOnline) {
      try {
        const headers = {
          "X-User-Id": String(user.id)
        };
        if (user.token) {
          headers["Authorization"] = `Bearer ${user.token}`;
        }

        const res = await fetch(`${API_BASE}/orders/my`, { headers });
        if (res.ok) {
          const serverOrders = await res.json();
          const localOrders = getLocalUserOrders();
          return serverOrders.map(o => {
            const matchedLocal = localOrders.find(lo => lo.numericId === o.id || lo.id === `FE-${o.id}`);
            return {
              id: `FE-${o.id}`,
              numericId: o.id,
              userId: user.id,
              name: matchedLocal?.name || (o.items && o.items[0]?.name ? o.items[0].name.split(" ")[0] + " Special" : "FoodieExpress"),
              items: o.items ? o.items.map(it => `${it.name} × ${it.quantity}`).join(", ") : "Ordered items",
              itemsList: o.items ? o.items.map(it => ({ name: it.name, qty: it.quantity, price: it.unitPrice })) : [],
              total: `₹${Number(o.totalAmount).toLocaleString("en-IN")}`,
              totalAmount: Number(o.totalAmount),
              status: formatStatus(o.status),
              deliveryAddress: o.deliveryAddress,
              date: formatOrderDate(o.orderedAt),
              orderedAt: o.orderedAt,
              etaMinutes: o.status === "DELIVERED" ? 0 : 25,
              driver: matchedLocal?.driver || { name: "Ramesh Kumar", phone: "+91 98765 12345", rating: "4.9", vehicle: "Yamaha Aerox • KA 01 EQ 4920" }
            };
          });
        }
      } catch (e) {
        console.warn("Backend orders fetch error, falling back to isolated local orders", e);
      }
    }

    return getLocalUserOrders();
  }

  function formatStatus(status) {
    if (!status) return "Placed";
    const s = String(status).toUpperCase();
    if (s === "PLACED") return "Placed";
    if (s === "CONFIRMED") return "Confirmed";
    if (s === "PREPARING") return "Preparing";
    if (s === "OUT_FOR_DELIVERY") return "Out for delivery";
    if (s === "DELIVERED") return "Delivered";
    if (s === "CANCELLED") return "Cancelled";
    return status;
  }

  function formatOrderDate(iso) {
    if (!iso) return "Just now";
    try {
      const d = new Date(iso);
      const diffMs = Date.now() - d.getTime();
      if (diffMs < 60000) return "Just now";
      if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} mins ago`;
      if (diffMs < 86400000) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Recently";
    }
  }

  async function createOrder(deliveryAddress, paymentMethod = "COD", couponCode = null) {
    const user = getCurrentUser();
    if (!user) throw new Error("Please log in to place an order.");

    const cart = getCart();
    if (!cart.length) throw new Error("Your cart is empty.");

    const totals = getCartTotals(couponCode);
    let createdOrder = null;

    if (isBackendOnline) {
      try {
        const payload = {
          deliveryAddress: deliveryAddress.trim(),
          items: cart.map(i => ({ foodItemId: Number(i.id) || 1, quantity: i.qty }))
        };
        const headers = {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id)
        };
        if (user.token) {
          headers["Authorization"] = `Bearer ${user.token}`;
        }

        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          createdOrder = {
            id: `FE-${data.id}`,
            numericId: data.id,
            userId: user.id,
            name: cart[0]?.restaurant || "FoodieExpress Kitchen",
            items: cart.map(i => `${i.name} × ${i.qty}`).join(", "),
            itemsList: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
            total: `₹${totals.total.toLocaleString("en-IN")}`,
            totalAmount: totals.total,
            status: "Placed",
            deliveryAddress: deliveryAddress.trim(),
            paymentMethod,
            date: "Just now",
            orderedAt: new Date().toISOString(),
            etaMinutes: 28,
            driver: { name: "Ramesh Kumar", phone: "+91 98765 12345", rating: "4.9", vehicle: "Yamaha Aerox • KA 01 EQ 4920" }
          };
        }
      } catch (e) {
        console.warn("Backend order creation failed, creating isolated order locally", e);
      }
    }

    if (!createdOrder) {
      const generatedId = Math.floor(2050 + Math.random() * 8000);
      createdOrder = {
        id: `FE-${generatedId}`,
        numericId: generatedId,
        userId: user.id,
        name: cart[0]?.restaurant || "FoodieExpress Kitchen",
        items: cart.map(i => `${i.name} × ${i.qty}`).join(", "),
        itemsList: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        total: `₹${totals.total.toLocaleString("en-IN")}`,
        totalAmount: totals.total,
        status: "Placed",
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod,
        date: "Just now",
        orderedAt: new Date().toISOString(),
        etaMinutes: 28,
        driver: { name: "Ramesh Kumar", phone: "+91 98765 12345", rating: "4.9", vehicle: "Yamaha Aerox • KA 01 EQ 4920" }
      };
    }

    // Save exclusively to current user's isolated order list
    const userOrders = getLocalUserOrders();
    userOrders.unshift(createdOrder);
    saveLocalUserOrders(userOrders);

    // Save active tracking order for this user
    localStorage.setItem(`foodie_active_tracking_${user.id}`, JSON.stringify(createdOrder));

    // Clear current user's cart
    clearCart();

    // Start background live order tracking progression for this order
    simulateOrderProgress(createdOrder.id, user.id);

    return createdOrder;
  }

  function simulateOrderProgress(orderId, userId) {
    const advance = (newStatus, eta) => {
      const key = `foodie_orders_${userId}`;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const orders = JSON.parse(raw);
        const o = orders.find(x => x.id === orderId);
        if (o && o.status !== "Cancelled" && o.status !== "Delivered") {
          o.status = newStatus;
          o.etaMinutes = eta;
          localStorage.setItem(key, JSON.stringify(orders));

          const activeKey = `foodie_active_tracking_${userId}`;
          const activeRaw = localStorage.getItem(activeKey);
          if (activeRaw) {
            const active = JSON.parse(activeRaw);
            if (active.id === orderId) {
              active.status = newStatus;
              active.etaMinutes = eta;
              localStorage.setItem(activeKey, JSON.stringify(active));
            }
          }
          window.dispatchEvent(new CustomEvent("foodie-tracking-updated", { detail: o }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    setTimeout(() => advance("Confirmed", 24), 7000);
    setTimeout(() => advance("Preparing", 18), 16000);
    setTimeout(() => advance("Out for delivery", 10), 30000);
  }

  function getActiveTrackingOrder() {
    const user = getCurrentUser();
    if (!user) return null;
    try {
      const raw = localStorage.getItem(`foodie_active_tracking_${user.id}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    const orders = getLocalUserOrders();
    return orders.find(o => o.status !== "Delivered" && o.status !== "Cancelled") || orders[0] || null;
  }

  async function cancelOrder(orderId) {
    const user = getCurrentUser();
    if (!user) throw new Error("Not authorized");
    const numeric = Number(String(orderId).replace("FE-", ""));

    if (isBackendOnline && numeric) {
      try {
        const headers = { "X-User-Id": String(user.id) };
        if (user.token) headers["Authorization"] = `Bearer ${user.token}`;
        await fetch(`${API_BASE}/orders/${numeric}/cancel`, { method: "PATCH", headers });
      } catch (e) {
        console.warn("Backend cancel error", e);
      }
    }

    const orders = getLocalUserOrders();
    const target = orders.find(o => o.id === orderId || o.numericId === numeric);
    if (target) {
      target.status = "Cancelled";
      target.etaMinutes = 0;
      saveLocalUserOrders(orders);
      const activeKey = `foodie_active_tracking_${user.id}`;
      const active = getActiveTrackingOrder();
      if (active && (active.id === orderId || active.numericId === numeric)) {
        active.status = "Cancelled";
        localStorage.setItem(activeKey, JSON.stringify(active));
      }
      window.dispatchEvent(new CustomEvent("foodie-tracking-updated", { detail: target }));
      return { success: true };
    }
    return { success: false, message: "Order not found" };
  }

  // Periodic heartbeat
  probeBackend();
  setInterval(probeBackend, 15000);

  // Expose API
  window.foodieApi = {
    API_BASE,
    DEMO_ACCOUNTS,
    isOnline: () => isBackendOnline,
    probeBackend,
    getCurrentUser,
    setCurrentUser,
    getAuthToken,
    logout,
    switchUser,
    login,
    register,
    getCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    getCartTotals,
    getOrders,
    createOrder,
    cancelOrder,
    getActiveTrackingOrder
  };
})();
