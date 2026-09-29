/**
 * FoodieExpress Main Application Script
 * Features:
 * - User-Isolated Authorization & Session State (JWT & Bearer Tokens)
 * - Live Backend API Integration with Graceful Offline Fallback
 * - Interactive Live Order Tracking Timeline with Animated Route & Scooter
 * - Dynamic Multi-User Account Switcher (Testing User A vs User B Isolation)
 * - Synchronized Cart with Coupon Support (WELCOME30, FOODIE20, FREEDEL)
 * - Responsive Theme & Dark Mode Management
 */

(() => {
  const { restaurants, foodItems, categories } = window.foodData;
  const favorites = new Set();
  let selectedCategory = "All";
  let activeView = "overview";
  let activeCoupon = "WELCOME30";
  let etaCountdownTimer = null;

  const $ = s => document.querySelector(s);
  const grid = $("#restaurantGrid");
  const input = $("#searchInput");

  /* ── Dark Mode ────────────────────────────────────────────── */
  let darkMode = localStorage.getItem("darkMode") === "true";
  function applyDarkMode(on) {
    document.documentElement.classList.toggle("dark", on);
    localStorage.setItem("darkMode", on);
    darkMode = on;
    const btn = $("#themeToggleBtn");
    if (btn) btn.textContent = on ? "☀️" : "🌙";
  }
  applyDarkMode(darkMode);

  const themeToggle = $("#themeToggleBtn");
  if (themeToggle) {
    themeToggle.onclick = () => applyDarkMode(!darkMode);
  }

  /* ── User & Authorization Session ─────────────────────────── */
  function updateAuthUI() {
    const user = foodieApi.getCurrentUser();
    const nameEl = $("#userName");
    const emailEl = $("#userEmail");
    const avatarEl = $("#userAvatar");
    const greetingEl = $("#greetingHeading");

    if (user) {
      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) {
        const initials = user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";
        avatarEl.textContent = initials;
      }
      if (greetingEl) {
        const h = new Date().getHours();
        const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
        greetingEl.innerHTML = `${greeting}, ${user.name.split(" ")[0]} <span>✦</span>`;
      }
    }
    updateNavCounts();
  }

  function openAccountSwitcher() {
    const currentUser = foodieApi.getCurrentUser();
    const demoAccounts = foodieApi.DEMO_ACCOUNTS;

    openModal(`
      <p class="eyebrow">Session Security &amp; Authorization</p>
      <h2>Authorized Accounts</h2>
      <p style="color:var(--muted);font-size:12.5px;margin:2px 0 20px">
        Switch between isolated user accounts to verify that <strong>User A never sees User B's orders or cart</strong>.
      </p>
      
      <div class="account-switch-list">
        ${demoAccounts.map(acc => `
          <div class="account-switch-card ${acc.id === currentUser.id ? 'active-account' : ''}" data-switch-id="${acc.id}">
            <div class="profile-avatar">${acc.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
            <div style="flex:1">
              <strong>${acc.name} ${acc.id === currentUser.id ? '<span class="status-pill status-placed" style="font-size:10px;padding:2px 6px">Active</span>' : ''}</strong>
              <small style="color:var(--muted);display:block">${acc.email}</small>
              <span style="font-size:10.5px;color:#3fa278">Private session token: <code>${acc.token.slice(0,18)}…</code></span>
            </div>
            ${acc.id !== currentUser.id ? `<button class="primary-button" style="padding:6px 14px;font-size:12px;height:auto">Switch</button>` : ''}
          </div>
        `).join("")}
      </div>

      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--line);display:flex;gap:10px">
        <a href="register.html" class="primary-button" style="flex:1;text-align:center;height:42px;display:grid;place-items:center;font-size:13px">
          + Register New Isolated User
        </a>
        <button id="modalLogoutBtn" class="link-button" style="color:var(--muted);font-size:13px;padding:0 12px">
          Log out
        </button>
      </div>
    `);

    document.querySelectorAll("[data-switch-id]").forEach(card => {
      card.onclick = () => {
        const id = Number(card.dataset.switchId);
        if (id !== currentUser.id) {
          foodieApi.switchUser(id);
          closeModal();
          updateAuthUI();
          updateCartUI();
          renderRestaurants();
          showToast(`Switched to ${card.querySelector("strong").textContent.trim()}! Private data loaded.`);
        }
      };
    });

    const logoutBtn = $("#modalLogoutBtn");
    if (logoutBtn) logoutBtn.onclick = () => foodieApi.logout();
  }

  const userCardBtn = $("#userCardBtn");
  if (userCardBtn) userCardBtn.onclick = openAccountSwitcher;

  const switchBtn = $("#switchUserBtn");
  if (switchBtn) switchBtn.onclick = openAccountSwitcher;

  const logoutBtn = $("#logoutBtn");
  if (logoutBtn) logoutBtn.onclick = () => foodieApi.logout();

  /* ── Backend Status Pill ──────────────────────────────────── */
  function updateBackendStatusPill(online) {
    const pill = $("#apiStatusPill");
    const text = $("#apiStatusText");
    if (!pill || !text) return;

    if (online) {
      pill.className = "api-status-pill online";
      text.textContent = "REST API Online (8080)";
      pill.title = "Connected to live Spring Boot REST API. Real database operations active.";
    } else {
      pill.className = "api-status-pill offline";
      text.textContent = "Offline Demo Mode";
      pill.title = "Spring Boot backend offline. Utilizing high-fidelity local isolated storage.";
    }
  }

  window.addEventListener("foodie-backend-status", e => updateBackendStatusPill(e.detail.online));
  window.addEventListener("foodie-user-changed", () => {
    updateAuthUI();
    updateCartUI();
  });

  /* ── Photos & Category Mapping ────────────────────────────── */
  const CAT_PHOTOS = {
    Pizza:          "1565299624946-b28f40a0ae38",
    Burgers:        "1568901346375-23c9450c58cd",
    Biryani:        "1565557623262-b51c2513a641",
    "South Indian": "1567620905732-2d1ec7ab7445",
    Chinese:        "1569718157624-e67bec5b5f17",
    Desserts:       "1563729784474-d77dde43e61d",
    Beverages:      "1495474472287-4d71bcdd2085",
    Healthy:        "1512621776951-a57141f2eefd",
    default:        "1504674900247-0877df9cc836",
  };
  const photoUrl = r => {
    const id = CAT_PHOTOS[r.category] || CAT_PHOTOS.default;
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=380&q=80`;
  };

  /* ── Stagger animation ────────────────────────────────────── */
  function animateCards() {
    document.querySelectorAll(".restaurant-card:not(.skeleton-card)").forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(22px)";
      card.style.transition = "none";
      requestAnimationFrame(() => {
        setTimeout(() => {
          card.style.transition = `opacity .38s ease ${i * 45}ms, transform .38s cubic-bezier(.22,.61,.36,1) ${i * 45}ms`;
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, 10);
      });
    });
  }

  /* ── Render Restaurants ───────────────────────────────────── */
  function renderRestaurants(skipSkeleton = false) {
    if (!skipSkeleton) {
      grid.innerHTML = Array.from({length: 6}, () => `
        <article class="restaurant-card skeleton-card">
          <div class="skeleton-img"></div>
          <div class="card-info">
            <div class="skeleton-line w80"></div>
            <div class="skeleton-line w50"></div>
            <div class="skeleton-line w60" style="margin-top:12px"></div>
          </div>
        </article>`).join("");
      setTimeout(_doRender, 240);
    } else {
      _doRender();
    }
  }

  function _doRender() {
    const query = input.value.toLowerCase().trim();
    const list = restaurants.filter(r =>
      (selectedCategory === "All" || r.category === selectedCategory) &&
      `${r.name} ${r.cuisine}`.toLowerCase().includes(query) &&
      (activeView !== "favorites" || favorites.has(r.name))
    );

    $("#restaurantHeading").textContent = activeView === "favorites" ? "Your favourites" : "Popular near you";

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">${activeView === "favorites" ? "🤍" : "🔍"}</div>
          <h3>${activeView === "favorites" ? "No favourites yet" : "No matches found"}</h3>
          <p>${activeView === "favorites" ? "Tap the heart on any restaurant card to save it here." : "Try a different search term or category."}</p>
        </div>`;
      return;
    }

    grid.innerHTML = list.map((r, i) => `
      <article class="restaurant-card" data-restaurant-id="${r.id}">
        <div class="food-image-real">
          <img src="${photoUrl(r)}" alt="${r.name}" loading="lazy">
          <button class="heart-button ${favorites.has(r.name) ? "liked" : ""}" data-favorite="${r.name}" aria-label="Favourite">
            ${favorites.has(r.name) ? "♥" : "♡"}
          </button>
          <span class="card-time-badge">⏱ ${r.time}</span>
        </div>
        <div class="card-info">
          <h3>${r.name}</h3>
          <div class="card-meta">
            <span class="rating">★ ${r.rating}</span>
            <span class="dot">•</span>
            <span>${r.cuisine}</span>
            <span class="dot">•</span>
            <span style="color:#3fa278;font-weight:600">${r.price === "₹" ? "Budget" : "Mid-range"}</span>
          </div>
          <div class="card-footer">
            <span>${r.emoji} ${r.category}</span>
            <button class="add-button ripple-btn" data-add-rest="${r.id}" aria-label="Add from ${r.name}">+</button>
          </div>
        </div>
      </article>`).join("");

    // Clicking card opens restaurant menu page
    document.querySelectorAll(".restaurant-card").forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest(".add-button") || e.target.closest(".heart-button")) return;
        const id = card.dataset.restaurantId;
        window.location.href = `restaurant.html?id=${id}`;
      };
    });

    // Add to cart from card
    document.querySelectorAll("[data-add-rest]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        ripple(e);
        const rId = Number(btn.dataset.addRest);
        const rest = restaurants.find(x => x.id === rId);
        if (rest) {
          foodieApi.addToCart({
            id: rId,
            name: `${rest.name} Special`,
            price: rest.price === "₹" ? 199 : 299,
            category: rest.category,
            emoji: rest.emoji,
            restaurant: rest.name,
            restaurantId: rest.id
          });
          showToast(`🛒 ${rest.name} Special added to cart`);
        }
      };
    });

    // Favorites toggle
    document.querySelectorAll("[data-favorite]").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const name = btn.dataset.favorite;
        if (favorites.has(name)) {
          favorites.delete(name);
          showToast("Removed from favourites");
        } else {
          favorites.add(name);
          showToast("💛 Saved to favourites");
        }
        renderRestaurants(true);
      };
    });

    animateCards();
  }

  /* ── User-Isolated Cart Management ────────────────────────── */
  function updateCartUI() {
    const cart = foodieApi.getCart();
    const totals = foodieApi.getCartTotals(activeCoupon);

    $("#cartCount").textContent = totals.count;
    $("#drawerCount").textContent = `(${totals.count})`;
    $("#subtotal").textContent = `₹${totals.subtotal.toLocaleString("en-IN")}`;
    $("#total").textContent = `₹${totals.total.toLocaleString("en-IN")}`;

    const mobBadge = $("#mobileCartBadge");
    if (mobBadge) mobBadge.textContent = totals.count || "";

    const itemsContainer = $("#cartItems");
    if (!itemsContainer) return;

    if (!cart.length) {
      itemsContainer.innerHTML = `
        <div class="empty-cart">
          <div>🛍️</div>
          <strong>Your cart is empty</strong>
          <p>Add fresh dishes from restaurants to get started.</p>
        </div>`;
      return;
    }

    itemsContainer.innerHTML = cart.map(i => `
      <div class="cart-row">
        <div class="cart-thumb">${i.emoji}</div>
        <div class="cart-row-info">
          <strong>${i.name}</strong>
          <small>₹${i.price} each</small>
        </div>
        <div class="qty-control">
          <button data-dec="${i.name}">−</button>
          <span>${i.qty}</span>
          <button data-inc="${i.name}">+</button>
        </div>
        <button class="remove-item" data-remove="${i.name}" aria-label="Remove">×</button>
      </div>`).join("");

    itemsContainer.querySelectorAll("[data-inc]").forEach(b => {
      b.onclick = () => foodieApi.updateCartQty(b.dataset.inc, 1);
    });
    itemsContainer.querySelectorAll("[data-dec]").forEach(b => {
      b.onclick = () => foodieApi.updateCartQty(b.dataset.dec, -1);
    });
    itemsContainer.querySelectorAll("[data-remove]").forEach(b => {
      b.onclick = () => foodieApi.removeFromCart(b.dataset.remove);
    });
  }

  window.addEventListener("foodie-cart-updated", updateCartUI);

  function bounceCartBadge() {
    const badge = $("#cartCount");
    if (!badge) return;
    badge.classList.remove("bounce");
    void badge.offsetWidth;
    badge.classList.add("bounce");
  }

  /* ── Toast Notifications ──────────────────────────────────── */
  function showToast(message, duration = 2600) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), duration);
  }

  /* ── Ripple ───────────────────────────────────────────────── */
  function ripple(e) {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    circle.className = "ripple";
    circle.style.cssText = `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px`;
    btn.appendChild(circle);
    circle.addEventListener("animationend", () => circle.remove());
  }

  /* ── Drawer & Modal Helpers ───────────────────────────────── */
  function toggleCart(open) {
    $("#cartDrawer").classList.toggle("open", open);
    $("#overlay").classList.toggle("visible", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  window.toggleCart = toggleCart;

  function openModal(content) {
    $("#modalContent").innerHTML = content;
    $("#modalBackdrop").classList.add("visible");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    $("#modalBackdrop").classList.remove("visible");
    document.body.style.overflow = "";
    if (etaCountdownTimer) clearInterval(etaCountdownTimer);
  }

  /* ── Interactive Live Order Tracking Timeline ──────────────── */
  const STATUS_STEPS = ["Placed", "Confirmed", "Preparing", "Out for delivery", "Delivered"];

  function renderLiveTracker(order) {
    if (!order) return;
    const currentStepIdx = STATUS_STEPS.indexOf(order.status) !== -1 ? STATUS_STEPS.indexOf(order.status) : 0;
    const isDelivered = order.status === "Delivered";
    const isCancelled = order.status === "Cancelled";

    // Progress percentage for animated line & scooter position
    const progressPercent = isCancelled ? 0 : Math.min(100, Math.round((currentStepIdx / (STATUS_STEPS.length - 1)) * 100));

    const trackerContent = `
      <div class="live-tracker-wrapper">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
          <div>
            <span class="auth-badge" style="font-size:10px;background:#eaf7f0;color:#3fa278;padding:2px 8px;border-radius:6px;font-weight:700">
              🔒 Order ID: ${order.id}
            </span>
            <h2 style="margin:4px 0 2px;font-size:22px">${order.name}</h2>
            <p style="color:var(--muted);font-size:12px;margin:0">${order.items} · ${order.total}</p>
          </div>
          <span class="status-pill ${isDelivered ? 'status-delivered' : isCancelled ? 'status-cancelled' : 'status-placed'}">
            ${order.status}
          </span>
        </div>

        <!-- Animated Route Map & Live Delivery Scooter -->
        <div class="route-map-card">
          <div class="map-backdrop">
            <svg class="route-svg" viewBox="0 0 400 120" preserveAspectRatio="none">
              <path class="route-track-bg" d="M 30 60 Q 140 20 200 60 T 370 60" />
              <path class="route-track-fill" d="M 30 60 Q 140 20 200 60 T 370 60" stroke-dashoffset="${340 - (340 * (progressPercent / 100))}" />
            </svg>
            
            <!-- Restaurant Pin -->
            <div class="map-pin rest-pin" title="Restaurant">
              <span>🏪</span>
              <small>Kitchen</small>
            </div>

            <!-- Animated Delivery Scooter -->
            <div class="map-scooter" style="left: calc(30px + (100% - 60px) * ${progressPercent / 100})">
              <div class="scooter-bubble ${order.status === 'Out for delivery' ? 'pulsing' : ''}">🛵</div>
            </div>

            <!-- Customer Home Pin -->
            <div class="map-pin home-pin" title="Your Delivery Address">
              <span>🏠</span>
              <small>Home</small>
            </div>
          </div>

          <!-- Live ETA Countdown -->
          <div class="live-eta-banner">
            <div>
              <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:var(--muted)">ESTIMATED ARRIVAL</span>
              <div class="eta-clock" id="liveEtaClock">
                ${isDelivered ? '🎉 Order Delivered!' : isCancelled ? '❌ Order Cancelled' : '⏱ Calculating arrival…'}
              </div>
            </div>
            <div style="text-align:right">
              <span style="font-size:11px;color:var(--muted)">Destination</span>
              <strong style="display:block;font-size:12.5px;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${order.deliveryAddress || "Home"}</strong>
            </div>
          </div>
        </div>

        <!-- Steps Timeline -->
        <div class="tracker-steps-horizontal">
          ${STATUS_STEPS.map((step, idx) => {
            const isDone = idx <= currentStepIdx && !isCancelled;
            const isCurrent = idx === currentStepIdx && !isDelivered && !isCancelled;
            return `
              <div class="step-col ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}">
                <div class="step-circle">${isDone ? '✓' : idx + 1}</div>
                <span class="step-name">${step}</span>
              </div>
            `;
          }).join("")}
        </div>

        <!-- Driver Card -->
        ${order.driver && !isCancelled ? `
          <div class="driver-info-card">
            <div class="driver-avatar">RK</div>
            <div style="flex:1">
              <strong>${order.driver.name} <span style="color:#e59819">★ ${order.driver.rating}</span></strong>
              <small style="color:var(--muted);display:block">${order.driver.vehicle}</small>
            </div>
            <div style="display:flex;gap:8px">
              <button class="driver-btn" onclick="alert('Calling rider at ${order.driver.phone}…')">📞 Call</button>
              <button class="driver-btn" onclick="alert('Live chat connected to ${order.driver.name}!')">💬 Chat</button>
            </div>
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="display:flex;gap:10px;margin-top:16px">
          ${(!isDelivered && !isCancelled) ? `
            <button class="link-button" id="cancelOrderActionBtn" style="color:#d04040;font-size:13px;font-weight:600">
              Cancel Order
            </button>
          ` : ''}
          <button class="primary-button" id="closeTrackerBtn" style="margin-left:auto;padding:0 24px;height:42px">
            Done <span>→</span>
          </button>
        </div>
      </div>
    `;

    openModal(trackerContent);

    // Live countdown calculation
    if (!isDelivered && !isCancelled) {
      let remainingSec = (order.etaMinutes || 24) * 60;
      const clock = $("#liveEtaClock");
      if (etaCountdownTimer) clearInterval(etaCountdownTimer);
      etaCountdownTimer = setInterval(() => {
        if (remainingSec <= 0) {
          clearInterval(etaCountdownTimer);
          if (clock) clock.textContent = "Arriving any moment!";
          return;
        }
        remainingSec--;
        const m = Math.floor(remainingSec / 60);
        const s = remainingSec % 60;
        if (clock) clock.textContent = `⏱ ~${m}m ${s < 10 ? '0' : ''}${s}s`;
      }, 1000);
    }

    const closeBtn = $("#closeTrackerBtn");
    if (closeBtn) closeBtn.onclick = closeModal;

    const cancelBtn = $("#cancelOrderActionBtn");
    if (cancelBtn) {
      cancelBtn.onclick = async () => {
        if (confirm("Are you sure you want to cancel this order?")) {
          await foodieApi.cancelOrder(order.id);
          showToast("Order cancelled.");
          closeModal();
          showView("orders");
        }
      };
    }
  }

  window.addEventListener("foodie-tracking-updated", e => {
    const backdrop = $("#modalBackdrop");
    if (backdrop && backdrop.classList.contains("visible")) {
      const active = foodieApi.getActiveTrackingOrder();
      if (active && active.id === e.detail.id) {
        renderLiveTracker(e.detail);
      }
    }
  });

  /* ── Views & Navigation ───────────────────────────────────── */
  async function showView(view) {
    activeView = view;
    document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === view));
    document.querySelectorAll(".mob-nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));

    const labels = { overview: "Overview", restaurants: "Restaurants", orders: "My orders", favorites: "Favourites", profile: "Profile", settings: "Settings" };
    const lbl = $("#breadcrumbLabel");
    if (lbl) lbl.textContent = labels[view] || view;

    if (view === "overview" || view === "restaurants" || view === "favorites") {
      $("#home").scrollIntoView({ behavior: "smooth" });
      renderRestaurants();
      return;
    }

    if (view === "orders") {
      const orders = await foodieApi.getOrders();
      const currentUser = foodieApi.getCurrentUser();

      openModal(`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div>
            <p class="eyebrow">Personal Order History</p>
            <h2>My Orders</h2>
          </div>
          <span class="auth-badge" style="font-size:11px;background:#eaf7f0;color:#3fa278;padding:3px 8px;border-radius:6px;font-weight:700">
            🔒 ${currentUser.name}'s Account
          </span>
        </div>

        <p style="color:var(--muted);font-size:12.5px;margin:0 0 18px">
          Orders are strictly private and isolated to your authorized session.
        </p>

        <div class="modal-list">
          ${orders.length ? orders.map(order => `
            <div class="modal-list-item order-card-item" data-order-id="${order.id}">
              <div style="flex:1">
                <div style="display:flex;align-items:center;gap:8px">
                  <strong style="font-size:14.5px">${order.name}</strong>
                  <span class="status-pill ${order.status === "Delivered" ? "status-delivered" : order.status === "Cancelled" ? "status-cancelled" : "status-placed"}">
                    ${order.status}
                  </span>
                </div>
                <small style="color:var(--muted);display:block;margin:3px 0">${order.items}</small>
                <div style="font-size:12px;font-weight:600;margin-top:4px">
                  <span>${order.total}</span> · <span style="color:var(--muted)">${order.date}</span>
                </div>
              </div>
              <div style="display:flex;gap:8px;align-items:center">
                <button class="track-btn" data-track-id="${order.id}">
                  Live Track 🛵
                </button>
                <button class="reorder-btn" data-reorder-id="${order.id}" title="Add items to cart">
                  ↻ Reorder
                </button>
              </div>
            </div>`).join("") : `
            <div class="empty-state">
              <div class="empty-icon">📦</div>
              <h3>No orders placed yet</h3>
              <p>Your orders will appear here once placed from your account.</p>
            </div>
          `}
        </div>
      `);

      // Track order button
      document.querySelectorAll("[data-track-id]").forEach(btn => {
        btn.onclick = () => {
          const o = orders.find(x => x.id === btn.dataset.trackId);
          if (o) renderLiveTracker(o);
        };
      });

      // Reorder button
      document.querySelectorAll("[data-reorder-id]").forEach(btn => {
        btn.onclick = () => {
          const o = orders.find(x => x.id === btn.dataset.reorderId);
          if (o && o.itemsList) {
            o.itemsList.forEach(it => foodieApi.addToCart({ name: it.name, price: it.price }, it.qty));
            closeModal();
            toggleCart(true);
            showToast("↻ Items added back into your cart!");
          }
        };
      });

    } else if (view === "profile") {
      const user = foodieApi.getCurrentUser();
      openModal(`
        <p class="eyebrow">Account Security &amp; Profile</p>
        <h2>Your Profile</h2>
        <div class="profile-head" style="margin-bottom:18px">
          <div class="profile-avatar">${user.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
          <div>
            <strong style="font-size:15px">${user.name}</strong>
            <p style="color:var(--muted);font-size:12px;margin:2px 0 4px">${user.email}</p>
            <span class="auth-badge" style="font-size:10px;background:#eaf7f0;color:#3fa278;padding:2px 6px;border-radius:4px;font-weight:700">
              Role: ${user.role || 'CUSTOMER'} · Session Verified
            </span>
          </div>
        </div>

        <form class="modal-form" id="profileForm">
          <label>Full Name<input id="editName" value="${user.name}" required></label>
          <label>Email Address<input id="editEmail" type="email" value="${user.email}" required></label>
          <label>Phone Number<input id="editPhone" type="tel" value="${user.phone || '+91 98765 43210'}"></label>
          <label>Default Delivery Address<textarea id="editAddress" rows="2">${user.address || 'Koramangala, Bengaluru'}</textarea></label>
          <button class="primary-button" style="margin-top:10px">Save Profile <span>→</span></button>
        </form>
      `);

      $("#profileForm").onsubmit = e => {
        e.preventDefault();
        const updated = {
          ...user,
          name: $("#editName").value.trim(),
          email: $("#editEmail").value.trim(),
          phone: $("#editPhone").value.trim(),
          address: $("#editAddress").value.trim()
        };
        foodieApi.setCurrentUser(updated);
        closeModal();
        updateAuthUI();
        showToast("✅ Profile saved successfully");
      };

    } else if (view === "settings") {
      openModal(`
        <p class="eyebrow">Preferences &amp; System</p>
        <h2>Settings</h2>
        <p style="color:var(--muted);font-size:12px;margin:2px 0 20px">Configure experience and authorization options.</p>
        
        <div class="setting-row">
          <div>
            <strong>🌙 Dark Theme</strong>
            <p style="font-size:11.5px;color:var(--muted)">Toggle dark interface appearance</p>
          </div>
          <button class="switch ${darkMode ? "on" : ""}" id="darkSettingSwitch"></button>
        </div>

        <div class="setting-row">
          <div>
            <strong>🔔 Live Order Updates</strong>
            <p style="font-size:11.5px;color:var(--muted)">Receive push alerts on status progression</p>
          </div>
          <button class="switch on"></button>
        </div>

        <div class="setting-row">
          <div>
            <strong>⚡ User Data Isolation</strong>
            <p style="font-size:11.5px;color:var(--muted)">Strict token &amp; ID session sandboxing</p>
          </div>
          <button class="switch on" title="Always enabled for security" style="opacity:0.8;cursor:default"></button>
        </div>
      `);

      $("#darkSettingSwitch").onclick = function() {
        this.classList.toggle("on");
        applyDarkMode(this.classList.contains("on"));
      };
    }
  }

  async function updateNavCounts() {
    try {
      const orders = await foodieApi.getOrders();
      const activeCount = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
      document.querySelectorAll(".nav-count").forEach(el => el.textContent = activeCount);
    } catch {}
  }

  /* ── Category Click Handlers ──────────────────────────────── */
  document.querySelectorAll(".category").forEach(btn => {
    btn.onclick = () => {
      document.querySelector(".category.active").classList.remove("active");
      btn.classList.add("active");
      selectedCategory = btn.dataset.category;
      renderRestaurants();
    };
  });

  /* ── Nav Links Click Handlers ─────────────────────────────── */
  document.querySelectorAll("[data-view]").forEach(item => {
    item.onclick = e => {
      e.preventDefault();
      showView(item.dataset.view);
      if (innerWidth < 700) $("#sidebar").classList.remove("open");
    };
  });

  /* ── Search & Drawer Controls ─────────────────────────────── */
  input.oninput = () => renderRestaurants(true);
  $("#cartOpen").onclick = () => toggleCart(true);
  $("#cartClose").onclick = () => toggleCart(false);
  $("#overlay").onclick = () => {
    toggleCart(false);
    $("#sidebar").classList.remove("open");
  };
  $("#menuToggle").onclick = () => {
    $("#sidebar").classList.toggle("open");
    $("#overlay").classList.toggle("visible", $("#sidebar").classList.contains("open"));
  };

  /* ── Interactive Checkout Flow ────────────────────────────── */
  $("#checkoutButton").onclick = () => {
    const cart = foodieApi.getCart();
    if (!cart.length) {
      showToast("Add items to your cart first! 🛒");
      return;
    }

    const user = foodieApi.getCurrentUser();
    const totals = foodieApi.getCartTotals(activeCoupon);

    openModal(`
      <p class="eyebrow">Secure Checkout</p>
      <h2>Confirm &amp; Place Order 📍</h2>
      <p style="color:var(--muted);font-size:12px;margin:2px 0 16px">
        Authorized as <strong>${user.name}</strong> (${user.email})
      </p>

      <form class="modal-form" id="checkoutForm">
        <label>Delivery Address
          <textarea id="modalDeliveryAddress" rows="2" required placeholder="House no, street, landmark…">${user.address || 'Flat 402, Green Glen Layout, Bellandur, Bengaluru'}</textarea>
        </label>
        
        <label>Payment Method
          <select id="modalPaymentMethod">
            <option value="UPI">UPI / QR (Google Pay, PhonePe, Paytm)</option>
            <option value="CARD">Credit / Debit Card</option>
            <option value="COD">Cash on Delivery (COD)</option>
          </select>
        </label>

        <label>Promo Code
          <div style="display:flex;gap:6px">
            <input id="modalPromoInput" value="${activeCoupon}" placeholder="WELCOME30, FOODIE20">
            <button type="button" id="modalApplyPromo" class="primary-button" style="padding:0 14px;height:auto">Apply</button>
          </div>
        </label>

        <div style="background:var(--line);padding:12px 14px;border-radius:9px;margin:12px 0">
          <div style="display:flex;justify-content:space-between;font-size:13px">
            <span>Items (${totals.count})</span>
            <strong>₹${totals.subtotal}</strong>
          </div>
          ${totals.discount > 0 ? `
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#3fa278;margin-top:4px">
              <span>Coupon (${totals.appliedCoupon.code})</span>
              <strong>-₹${totals.discount}</strong>
            </div>
          ` : ''}
          <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-top:4px">
            <span>Delivery</span>
            <span>₹${totals.deliveryFee}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:800;border-top:1px dashed var(--muted);padding-top:8px;margin-top:8px">
            <span>Total Amount</span>
            <span>₹${totals.total}</span>
          </div>
        </div>

        <button class="primary-button" id="submitOrderBtn" style="height:46px;font-size:14.5px">
          Place Order Now <span>→</span>
        </button>
      </form>
    `);

    $("#modalApplyPromo").onclick = () => {
      activeCoupon = $("#modalPromoInput").value.trim();
      $("#checkoutButton").click();
      showToast("Coupon updated");
    };

    $("#checkoutForm").onsubmit = async (e) => {
      e.preventDefault();
      const addr = $("#modalDeliveryAddress").value.trim();
      const pay = $("#modalPaymentMethod").value;
      const btn = $("#submitOrderBtn");
      btn.textContent = "Authorizing & Placing order…";
      btn.disabled = true;

      try {
        const order = await foodieApi.createOrder(addr, pay, activeCoupon);
        closeModal();
        toggleCart(false);
        showToast("🎉 Order placed! Tracking delivery live 🛵", 3200);
        updateNavCounts();
        setTimeout(() => renderLiveTracker(order), 300);
      } catch (err) {
        showToast(`Failed: ${err.message}`);
        btn.textContent = "Place Order Now →";
        btn.disabled = false;
      }
    };
  };

  /* ── Modal Backdrop Click ─────────────────────────────────── */
  $("#modalBackdrop").onclick = e => { if (e.target === $("#modalBackdrop")) closeModal(); };
  $("#modalClose").onclick = closeModal;

  /* ── Promo Banner ─────────────────────────────────────────── */
  const promoBtn = $("#promoButton");
  if (promoBtn) {
    promoBtn.onclick = () => {
      activeCoupon = "WELCOME30";
      showToast("🎁 Coupon WELCOME30 applied to your checkout!");
      toggleCart(true);
    };
  }

  /* ── Notification Popover ─────────────────────────────────── */
  const notifBtn = $("#notificationButton");
  if (notifBtn) {
    notifBtn.onclick = () => {
      let pop = $(".notification-pop");
      if (!pop) {
        pop = document.createElement("div");
        pop.className = "notification-pop";
        pop.innerHTML = `
          <div class="notif-header">
            <strong>Security &amp; Notifications</strong>
            <span class="notif-badge">Active</span>
          </div>
          <div class="notif-item">
            <span class="notif-icon">🔒</span>
            <div>
              <strong>Private Session Active</strong>
              <p>Your orders and cart are isolated and secured with token authorization.</p>
            </div>
          </div>
          <div class="notif-item">
            <span class="notif-icon">🎁</span>
            <div>
              <strong>Welcome Discount</strong>
              <p>Use code <strong>WELCOME30</strong> for 30% off your meal!</p>
            </div>
          </div>`;
        document.querySelector(".topbar").append(pop);
      }
      pop.classList.toggle("visible");
    };
  }

  document.addEventListener("click", e => {
    const pop = $(".notification-pop");
    if (pop && notifBtn && !pop.contains(e.target) && !notifBtn.contains(e.target)) {
      pop.classList.remove("visible");
    }
  });

  /* ── Location Modal ───────────────────────────────────────── */
  const locBtn = $("#locationButton");
  if (locBtn) {
    locBtn.onclick = () => {
      const user = foodieApi.getCurrentUser();
      openModal(`
        <p class="eyebrow">Delivery Location</p>
        <h2>Select Delivery Address 📍</h2>
        <div class="saved-addresses" style="margin-top:16px">
          <div class="address-pill active" data-addr="Koramangala 4th Block, Bengaluru">
            🏠 Home – Koramangala 4th Block, Bengaluru
          </div>
          <div class="address-pill" data-addr="Indiranagar 100ft Road, Bengaluru">
            🏢 Office – Indiranagar 100ft Road, Bengaluru
          </div>
          <div class="address-pill" data-addr="HSR Layout Sector 1, Bengaluru">
            📍 Other – HSR Layout Sector 1, Bengaluru
          </div>
        </div>
      `);

      document.querySelectorAll(".address-pill").forEach(pill => {
        pill.onclick = () => {
          document.querySelectorAll(".address-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          const selected = pill.dataset.addr;
          $("#locationButton strong").textContent = selected;
          user.address = selected;
          foodieApi.setCurrentUser(user);
          closeModal();
          showToast(`Location set to ${selected}`);
        };
      });
    };
  }

  /* ── Init ─────────────────────────────────────────────────── */
  updateAuthUI();
  renderRestaurants();
  updateCartUI();
  updateNavCounts();
})();
