const products = [
  {
    id: "kl-75-aurora",
    name: "KL-75 Aurora",
    category: "keyboards",
    summary: "Premium 75% aluminum keyboard with hot-swap PCB and gasket mount.",
    basePrice: 219,
    colorClass: "case-onyx",
    status: "Active",
  },
  {
    id: "kl-65-phantom",
    name: "KL-65 Phantom",
    category: "keyboards",
    summary: "Compact wireless 65% board with quiet dampening and low-latency mode.",
    basePrice: 179,
    colorClass: "case-forest",
    status: "Active",
  },
  {
    id: "kl-tkl-forge",
    name: "KL-TKL Forge",
    category: "keyboards",
    summary: "Tournament TKL build with hot-swap PCB and reinforced aluminum plate.",
    basePrice: 199,
    colorClass: "case-clay",
    status: "Active",
  },
  {
    id: "retro-keycaps",
    name: "Retro Keycap Set",
    category: "parts",
    summary: "Doubleshot PBT profile with warm legends and broad layout support.",
    basePrice: 69,
    colorClass: "case-silver",
    status: "Draft",
  },
];

const optionSets = {
  layouts: [
    { id: "65", label: "65%", delta: 0, code: "65" },
    { id: "75", label: "75%", delta: 20, code: "75" },
    { id: "tkl", label: "TKL", delta: 30, code: "TKL" },
    { id: "full", label: "Full-size", delta: 45, code: "FS" },
  ],
  colors: [
    { id: "onyx", label: "Onyx", className: "case-onyx", value: "#111820", code: "ON" },
    { id: "silver", label: "Silver", className: "case-silver", value: "#c7d0d8", code: "SV" },
    { id: "forest", label: "Forest", className: "case-forest", value: "#1f473a", code: "FR" },
    { id: "clay", label: "Clay", className: "case-clay", value: "#9d5245", code: "CL" },
  ],
  switches: [
    { id: "linear-red", label: "Linear Red", delta: 0, code: "LR" },
    { id: "tactile-brown", label: "Tactile Brown", delta: 12, code: "TB" },
    { id: "clicky-blue", label: "Clicky Blue", delta: 10, code: "CB" },
    { id: "silent-black", label: "Silent Black", delta: 18, code: "SB" },
  ],
  keycaps: [
    { id: "dark-pbt", label: "Dark PBT", delta: 0, code: "DK" },
    { id: "retro", label: "Retro Beige", delta: 25, code: "RT" },
    { id: "minimal", label: "Minimal White", delta: 20, code: "MW" },
    { id: "mint", label: "Mint Accent", delta: 28, code: "MA" },
  ],
};

const state = {
  category: "all",
  search: "",
  productId: products[0].id,
  layout: "75",
  color: "onyx",
  switches: "linear-red",
  keycaps: "dark-pbt",
  cart: [],
  savedConfigs: [],
  orders: [
    {
      id: "KL-1024",
      items: "KL-65 Phantom, Desk Mat",
      status: "Paid",
      total: 248,
    },
    {
      id: "KL-1018",
      items: "Retro Keycap Set",
      status: "Fulfilled",
      total: 69,
    },
  ],
};

const storageKey = "keeblab-store-state";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const byId = (id) => document.getElementById(id);
const selectedProduct = () => products.find((product) => product.id === state.productId);
const selected = (set, id) => optionSets[set].find((option) => option.id === id);
const formatDelta = (value) => (value > 0 ? `+${currency.format(value)}` : "+$0");

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved) return;
    state.cart = Array.isArray(saved.cart) ? saved.cart : [];
    state.savedConfigs = Array.isArray(saved.savedConfigs) ? saved.savedConfigs : [];
    state.orders = Array.isArray(saved.orders) && saved.orders.length ? saved.orders : state.orders;
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function persistState() {
  localStorage.setItem(storageKey, JSON.stringify({
    cart: state.cart,
    savedConfigs: state.savedConfigs,
    orders: state.orders,
  }));
}

function buildCode() {
  const product = selectedProduct();
  const layout = selected("layouts", state.layout);
  const color = selected("colors", state.color);
  const switches = selected("switches", state.switches);
  const keycaps = selected("keycaps", state.keycaps);
  return `${product.name.replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase()}-${layout.code}-${color.code}-${switches.code}-${keycaps.code}`;
}

function totalPrice() {
  const product = selectedProduct();
  return product.basePrice
    + selected("layouts", state.layout).delta
    + selected("switches", state.switches).delta
    + selected("keycaps", state.keycaps).delta;
}

function renderProducts() {
  const grid = byId("productGrid");
  const query = state.search.toLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory = state.category === "all" || product.category === state.category;
    const matchesSearch = `${product.name} ${product.summary}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = filtered.map((product) => `
    <article class="product-card">
      <div class="product-thumb">
        <div class="mini-board ${product.colorClass}"></div>
      </div>
      <div class="product-info">
        <div>
          <h3>${product.name}</h3>
          <p>${product.summary}</p>
        </div>
        <div class="price-row">
          <span class="price">${currency.format(product.basePrice)}</span>
          <button class="button" type="button" ${product.category === "keyboards" ? `data-configure="${product.id}"` : `data-quick-add="${product.id}"`}>
            ${product.category === "keyboards" ? "Configure" : "Add"}
          </button>
        </div>
      </div>
    </article>
  `).join("");

  if (!filtered.length) {
    grid.innerHTML = `<p class="product-summary">No products match this search.</p>`;
  }
}

function renderAdmin() {
  byId("adminTable").innerHTML = `
    <div class="admin-row header">
      <span>Product</span><span>Category</span><span>Status</span><span>Price</span>
    </div>
    ${products.map((product) => `
      <div class="admin-row">
        <strong>${product.name}</strong>
        <span>${product.category}</span>
        <span>${product.status}</span>
        <span>${currency.format(product.basePrice)}</span>
      </div>
    `).join("")}
  `;
}

function renderOrders() {
  byId("orderList").innerHTML = state.orders.length
    ? state.orders.map((order) => `
      <article>
        <strong>#${order.id}</strong>
        <span>${order.items} - ${currency.format(order.total)}</span>
        <em>${order.status}</em>
      </article>
    `).join("")
    : `<article><span>No orders yet.</span></article>`;
}

function renderSavedConfigs() {
  byId("savedConfigList").innerHTML = state.savedConfigs.length
    ? state.savedConfigs.map((config, index) => `
      <article>
        <strong>${config.code}</strong>
        <span>${config.productName} - ${currency.format(config.price)}</span>
        <button class="button" type="button" data-load-config="${index}">Load</button>
      </article>
    `).join("")
    : `<article><span>No saved configurations yet.</span></article>`;
}

function renderProductSelect() {
  byId("productSelect").innerHTML = products
    .filter((product) => product.category === "keyboards")
    .map((product) => `<option value="${product.id}">${product.name}</option>`)
    .join("");
}

function renderOptions(containerId, setName, activeId, stateKey) {
  byId(containerId).innerHTML = optionSets[setName].map((option) => `
    <button class="option ${option.id === activeId ? "active" : ""}" type="button" data-option="${stateKey}" data-value="${option.id}">
      ${option.label}
    </button>
  `).join("");
}

function renderColors() {
  byId("colorOptions").innerHTML = optionSets.colors.map((color) => `
    <button
      class="swatch ${color.id === state.color ? "active" : ""}"
      type="button"
      title="${color.label}"
      aria-label="${color.label}"
      style="background: ${color.value}"
      data-option="color"
      data-value="${color.id}">
    </button>
  `).join("");
}

function renderConfigurator() {
  const product = selectedProduct();
  const layout = selected("layouts", state.layout);
  const color = selected("colors", state.color);
  const switches = selected("switches", state.switches);
  const keycaps = selected("keycaps", state.keycaps);
  const keyboard = byId("configuredKeyboard");

  byId("productSelect").value = product.id;
  byId("viewerName").textContent = product.name;
  byId("configSlug").textContent = product.id;
  byId("configName").textContent = product.name;
  byId("configSummary").textContent = product.summary;
  byId("basePrice").textContent = currency.format(product.basePrice);
  byId("layoutPrice").textContent = formatDelta(layout.delta);
  byId("switchPrice").textContent = formatDelta(switches.delta);
  byId("keycapPrice").textContent = formatDelta(keycaps.delta);
  byId("colorName").textContent = color.label;
  byId("totalPrice").textContent = currency.format(totalPrice());
  byId("buildCode").textContent = buildCode();
  keyboard.className = `keyboard-case ${color.className}`;
  if (window.keebViewer) {
    window.keebViewer.update({
      caseColor: color.value,
      layout: layout.id,
      keycaps: keycaps.id,
    });
  }

  renderOptions("layoutOptions", "layouts", state.layout, "layout");
  renderOptions("switchOptions", "switches", state.switches, "switches");
  renderOptions("keycapOptions", "keycaps", state.keycaps, "keycaps");
  renderColors();
}

function renderCart() {
  byId("cartCount").textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  byId("cartItems").innerHTML = state.cart.length
    ? state.cart.map((item, index) => `
      <div class="cart-line">
        <div>
          <strong>${item.productName}</strong>
          <span>${item.code} - ${item.quantity} x ${currency.format(item.unitPrice)}</span>
        </div>
        <div class="quantity-controls">
          <button type="button" data-quantity="${index}" data-delta="-1" aria-label="Decrease quantity">-</button>
          <strong>${item.quantity}</strong>
          <button type="button" data-quantity="${index}" data-delta="1" aria-label="Increase quantity">+</button>
          <button class="remove-line" type="button" data-remove="${index}" aria-label="Remove item">X</button>
        </div>
      </div>
    `).join("")
    : `<div class="cart-line"><span>Your cart is empty.</span></div>`;

  const cartTotal = state.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  byId("cartTotal").textContent = currency.format(cartTotal);
  persistState();
}

function addCurrentBuildToCart() {
  const product = selectedProduct();
  const code = buildCode();
  const existing = state.cart.find((item) => item.code === code);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      productName: product.name,
      code,
      unitPrice: totalPrice(),
      quantity: 1,
      configuration: {
        productId: state.productId,
        layout: state.layout,
        color: state.color,
        switches: state.switches,
        keycaps: state.keycaps,
      },
    });
  }

  byId("checkoutState").textContent = "";
  renderCart();
  openCart();
}

function openCart() {
  byId("cartDrawer").classList.add("open");
  byId("cartDrawer").setAttribute("aria-hidden", "false");
  byId("scrim").classList.add("open");
}

function closeCart() {
  byId("cartDrawer").classList.remove("open");
  byId("cartDrawer").setAttribute("aria-hidden", "true");
  byId("scrim").classList.remove("open");
}

function bindEvents() {
  byId("search").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      document.querySelectorAll("[data-category]").forEach((segment) => segment.classList.remove("active"));
      button.classList.add("active");
      renderProducts();
    });
  });

  byId("productGrid").addEventListener("click", (event) => {
    const configureButton = event.target.closest("[data-configure]");
    const quickAddButton = event.target.closest("[data-quick-add]");

    if (configureButton) {
      state.productId = configureButton.dataset.configure;
      renderConfigurator();
      location.hash = "configurator";
    }

    if (quickAddButton) {
      const product = products.find((item) => item.id === quickAddButton.dataset.quickAdd);
      state.cart.push({
        productName: product.name,
        code: product.id.toUpperCase(),
        unitPrice: product.basePrice,
        quantity: 1,
      });
      renderCart();
      openCart();
    }
  });

  byId("productSelect").addEventListener("change", (event) => {
    state.productId = event.target.value;
    renderConfigurator();
  });

  document.addEventListener("click", (event) => {
    const option = event.target.closest("[data-option]");
    if (!option) return;
    state[option.dataset.option] = option.dataset.value;
    renderConfigurator();
  });

  document.querySelectorAll("[data-viewer-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.viewerMode;
      document.querySelectorAll("[data-viewer-mode]").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      byId("webglViewer").classList.toggle("hidden", mode !== "webgl");
      byId("webgpuPanel").classList.toggle("hidden", mode !== "webgpu");
      if (mode === "webgpu") renderWebGpuStatus();
    });
  });

  document.querySelectorAll("[data-viewer-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!window.keebViewer) return;
      const action = button.dataset.viewerAction;
      if (action === "reset") {
        window.keebViewer.reset();
        return;
      }
      const active = button.classList.toggle("active");
      if (action === "autorotate") window.keebViewer.setAutoRotate(active);
      if (action === "explode") window.keebViewer.setExploded(active);
    });
  });

  byId("addToCart").addEventListener("click", addCurrentBuildToCart);
  byId("saveConfig").addEventListener("click", () => {
    const product = selectedProduct();
    const code = buildCode();
    const existing = state.savedConfigs.find((config) => config.code === code);

    if (!existing) {
      state.savedConfigs.unshift({
        code,
        productName: product.name,
        price: totalPrice(),
        configuration: {
          productId: state.productId,
          layout: state.layout,
          color: state.color,
          switches: state.switches,
          keycaps: state.keycaps,
        },
      });
    }

    persistState();
    renderSavedConfigs();
    byId("checkoutState").textContent = `Saved ${code} locally.`;
    location.hash = "orders";
  });
  byId("cartButton").addEventListener("click", openCart);
  byId("closeCart").addEventListener("click", closeCart);
  byId("scrim").addEventListener("click", closeCart);

  byId("cartItems").addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-quantity]");
    if (quantityButton) {
      const item = state.cart[Number(quantityButton.dataset.quantity)];
      item.quantity += Number(quantityButton.dataset.delta);
      if (item.quantity <= 0) {
        state.cart.splice(Number(quantityButton.dataset.quantity), 1);
      }
      renderCart();
      return;
    }

    const button = event.target.closest("[data-remove]");
    if (!button) return;
    state.cart.splice(Number(button.dataset.remove), 1);
    renderCart();
  });

  byId("checkoutButton").addEventListener("click", () => {
    if (!state.cart.length) {
      byId("checkoutState").textContent = "Add a build before checkout.";
      return;
    }

    const orderId = `KL-${Math.floor(1100 + Math.random() * 8900)}`;
    const total = state.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    state.orders.unshift({
      id: orderId,
      items: state.cart.map((item) => item.productName).join(", "),
      status: "Paid",
      total,
    });
    state.cart = [];
    renderCart();
    renderOrders();
    persistState();
    byId("checkoutState").textContent = `Checkout simulated. Order #${orderId} created.`;
  });

  byId("savedConfigList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-load-config]");
    if (!button) return;
    const config = state.savedConfigs[Number(button.dataset.loadConfig)];
    Object.assign(state, config.configuration);
    renderConfigurator();
    location.hash = "configurator";
  });
}

function renderWebGpuStatus() {
  const supported = Boolean(navigator.gpu);
  byId("webgpuBadge").textContent = supported ? "Available" : "Unavailable";
  byId("webgpuStatus").textContent = supported
    ? "This browser exposes WebGPU. The next step is a dedicated procedural material preview."
    : "WebGPU is not available in this browser or context. The stable WebGL viewer remains active for product inspection.";
}

function init() {
  loadState();
  renderProductSelect();
  renderProducts();
  renderAdmin();
  renderOrders();
  renderSavedConfigs();
  renderConfigurator();
  renderCart();
  bindEvents();
}

init();
