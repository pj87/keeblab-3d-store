(function registerUI() {
  const {
    buildCode,
    byId,
    formatDelta,
    formatMoney,
    optionSets,
    persistState,
    products,
    selected,
    selectedProduct,
    state,
    totalPrice,
  } = window.KeebLabStore;

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
            <span class="price">${formatMoney(product.basePrice)}</span>
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
          <span>${formatMoney(product.basePrice)}</span>
        </div>
      `).join("")}
    `;
  }

  function renderOrders() {
    byId("orderList").innerHTML = state.orders.length
      ? state.orders.map((order) => `
        <article>
          <strong>#${order.id}</strong>
          <span>${order.items} - ${formatMoney(order.total)}</span>
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
          <span>${config.productName} - ${formatMoney(config.price)}</span>
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
    byId("basePrice").textContent = formatMoney(product.basePrice);
    byId("layoutPrice").textContent = formatDelta(layout.delta);
    byId("switchPrice").textContent = formatDelta(switches.delta);
    byId("keycapPrice").textContent = formatDelta(keycaps.delta);
    byId("colorName").textContent = color.label;
    byId("totalPrice").textContent = formatMoney(totalPrice());
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
            <span>${item.code} - ${item.quantity} x ${formatMoney(item.unitPrice)}</span>
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
    byId("cartTotal").textContent = formatMoney(cartTotal);
    persistState();
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

  function renderWebGpuStatus() {
    const supported = Boolean(navigator.gpu);
    byId("webgpuBadge").textContent = supported ? "Available" : "Unavailable";
    byId("webgpuStatus").textContent = supported
      ? "This browser exposes WebGPU. The next step is a dedicated procedural material preview."
      : "WebGPU is not available in this browser or context. The stable WebGL viewer remains active for product inspection.";
  }

  window.KeebLabUI = {
    closeCart,
    openCart,
    renderAdmin,
    renderCart,
    renderConfigurator,
    renderOrders,
    renderProducts,
    renderProductSelect,
    renderSavedConfigs,
    renderWebGpuStatus,
  };
})();
