const {foodItems, restaurants, categories} = window.foodData;
const search     = document.querySelector("#menuSearch");
const catFilter  = document.querySelector("#menuCategory");
const restFilter = document.querySelector("#menuRestaurant");
let page = 1;
const pageSize = 32;

/* ── Populate filters ─────────────────────────────────────── */
categories.forEach(item =>
  catFilter.insertAdjacentHTML("beforeend", `<option value="${item.name}">${item.name}</option>`)
);
restaurants.forEach(item =>
  restFilter.insertAdjacentHTML("beforeend", `<option value="${item.name}">${item.name}</option>`)
);

/* ── Skeleton loader ──────────────────────────────────────── */
function showMenuSkeletons(n = 8) {
  document.querySelector("#foodGrid").innerHTML = Array.from({length: n}, () => `
    <article class="food-card">
      <div class="food-card-art skeleton-art"></div>
      <div class="food-card-info">
        <div class="skeleton-line w70"></div>
        <div class="skeleton-line w90" style="margin-top:5px"></div>
        <div class="food-card-footer" style="margin-top:14px">
          <div class="skeleton-line w30" style="margin:0"></div>
          <div class="skeleton-circle"></div>
        </div>
      </div>
    </article>`).join("");
}

/* ── Stagger animation ────────────────────────────────────── */
function animateMenuCards() {
  document.querySelectorAll(".food-card:not(.skeleton-card)").forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(18px)";
    card.style.transition = "none";
    requestAnimationFrame(() => {
      setTimeout(() => {
        card.style.transition = `opacity .34s ease ${i * 40}ms, transform .34s cubic-bezier(.22,.61,.36,1) ${i * 40}ms`;
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 10);
    });
  });
}

/* ── Toast (self-contained) ───────────────────────────────── */
function menuToast(msg) {
  let t = document.querySelector("#menuToast");
  if (!t) {
    t = document.createElement("div");
    t.id = "menuToast";
    t.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translate(-50%,20px);background:#1e2335;color:#fff;padding:11px 20px;border-radius:9px;font:500 12.5px 'DM Sans',sans-serif;opacity:0;transition:opacity .28s,transform .28s;z-index:99;white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.22)";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  t.style.transform = "translate(-50%,0)";
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translate(-50%,20px)"; }, 2400);
}

/* ── Render ───────────────────────────────────────────────── */
function renderMenu(instant = false) {
  if (!instant) {
    showMenuSkeletons();
    setTimeout(_doMenuRender, 380);
  } else {
    _doMenuRender();
  }
}

function _doMenuRender() {
  const query = search.value.toLowerCase();
  const filtered = foodItems.filter(item =>
    (!query || `${item.name} ${item.restaurant} ${item.category}`.toLowerCase().includes(query)) &&
    (catFilter.value === "All"  || item.category   === catFilter.value) &&
    (restFilter.value === "All" || item.restaurant === restFilter.value)
  );
  const pages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  page = Math.min(page, pages);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const countEl = document.querySelector("#menuCount");
  countEl.textContent = `Showing ${filtered.length
    ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`
    : "0"} of ${filtered.length.toLocaleString("en-IN")} items`;

  const grid = document.querySelector("#foodGrid");

  if (!visible.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#9a9fa8">
        <div style="font-size:52px;margin-bottom:14px">🔍</div>
        <strong style="font-size:15px;display:block;color:#3e4558;margin-bottom:8px">No food items found</strong>
        <p style="font-size:12px">Try another search or adjust your filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = visible.map(item => `
    <article class="food-card">
      <div class="food-card-art">
        <span>${item.emoji}</span>
      </div>
      <div class="food-card-info">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="food-card-footer">
          <div>
            <strong>₹${item.price}</strong><br>
            <span class="veg" style="color:${item.vegetarian ? "#309c6c" : "#d04040"}">
              ${item.vegetarian ? "● Veg" : "● Non-veg"}
            </span>
          </div>
          <button class="add-btn" data-item="${item.id}" aria-label="Add ${item.name}">+</button>
        </div>
      </div>
    </article>`).join("");

  // add-to-cart feedback with pulse animation & foodieApi integration
  document.querySelectorAll(".add-btn[data-item]").forEach(btn => {
    btn.onclick = function() {
      const itemId = Number(this.dataset.item);
      const item = foodItems.find(f => f.id === itemId);
      if (item && window.foodieApi) {
        foodieApi.addToCart(item);
        updateMenuCartCount();
      }
      this.textContent = "✓";
      this.style.background = "linear-gradient(135deg,#3fa278,#2e8b60)";
      this.style.transform = "scale(1.2)";
      setTimeout(() => {
        this.textContent = "+";
        this.style.background = "";
        this.style.transform = "";
      }, 900);
      menuToast(`🛒 ${item ? item.name : "Item"} added to cart`);
    };
  });

  // pagination
  const totalPages = Math.min(pages, 10);
  document.querySelector("#menuPager").innerHTML =
    (page > 1 ? `<button data-page="${page - 1}">←</button>` : "") +
    Array.from({length: totalPages}, (_, i) => {
      const p = i + 1;
      return `<button class="${page === p ? "active" : ""}" data-page="${p}">${p}</button>`;
    }).join("") +
    (page < totalPages ? `<button data-page="${page + 1}">→</button>` : "");

  document.querySelectorAll("[data-page]").forEach(btn =>
    btn.onclick = () => { page = Number(btn.dataset.page); renderMenu(true); window.scrollTo({top: 0, behavior: "smooth"}); }
  );

  animateMenuCards();
}

/* ── Events ───────────────────────────────────────────────── */
[search, catFilter, restFilter].forEach(control =>
  control.addEventListener("input", () => { page = 1; renderMenu(control === search); })
);

/* ── Dark mode sync from localStorage ────────────────────── */
if (localStorage.getItem("darkMode") === "true") document.documentElement.classList.add("dark");

function updateMenuCartCount() {
  if (window.foodieApi) {
    const cart = foodieApi.getCart();
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const countEl = document.querySelector("#menuCartCount");
    if (countEl) countEl.textContent = count;
  }
}
window.addEventListener("foodie-cart-updated", updateMenuCartCount);
updateMenuCartCount();

renderMenu();
