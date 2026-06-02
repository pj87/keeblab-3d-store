(function registerUI() {
  const {
    buildCode,
    byId,
    canBuyProduct,
    formatDelta,
    formatMoney,
    optionSets,
    persistState,
    selected,
    selectedProduct,
    state,
    totalPrice,
  } = window.KeebLabStore;

  function renderProducts() {
    const grid = byId("productGrid");
    const query = state.search.toLowerCase();
    const filtered = state.products.filter((product) => {
      if (product.status !== "Active") return false;
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
            <span class="stock-pill ${product.stockQuantity > 0 ? "" : "empty"}">${product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Sold out"}</span>
          </div>
          <div class="price-row">
            <span class="price">${formatMoney(product.basePrice)}</span>
            <button class="button" type="button" ${canBuyProduct(product) ? (product.category === "keyboards" ? `data-configure="${product.id}"` : `data-quick-add="${product.id}"`) : "disabled"}>
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
        <span>Product</span><span>Category</span><span>Status</span><span>Stock</span><span>Price</span><span>Actions</span>
      </div>
      ${state.products.map((product) => `
        <div class="admin-row">
          <strong>${product.name}</strong>
          <span>${product.category}</span>
          <span>${product.status}</span>
          <span>${product.stockQuantity}</span>
          <span>${formatMoney(product.basePrice)}</span>
          <span class="admin-actions">
            <button class="button" type="button" data-edit-product="${product.id}">Edit</button>
            <button class="button" type="button" data-delete-product="${product.id}">Delete</button>
          </span>
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
    const keyboardProducts = state.products.filter((product) => product.category === "keyboards" && canBuyProduct(product));
    byId("productSelect").innerHTML = keyboardProducts
      .map((product) => `<option value="${product.id}">${product.name}</option>`)
      .join("");
    byId("productSelect").disabled = keyboardProducts.length === 0;
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

    if (!product) {
      byId("viewerName").textContent = "No keyboard selected";
      byId("configSlug").textContent = "empty";
      byId("configName").textContent = "Create a keyboard product";
      byId("configSummary").textContent = "Use the admin panel to add an active keyboard product.";
      byId("basePrice").textContent = "$0";
      byId("layoutPrice").textContent = "+$0";
      byId("switchPrice").textContent = "+$0";
      byId("keycapPrice").textContent = "+$0";
      byId("colorName").textContent = "Onyx";
      byId("totalPrice").textContent = "$0";
      byId("buildCode").textContent = "NO-PRODUCT";
      return;
    }
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

  function resetAdminForm() {
    byId("adminProductId").value = "";
    byId("adminProductName").value = "";
    byId("adminProductCategory").value = "keyboards";
    byId("adminProductPrice").value = "";
    byId("adminProductStatus").value = "Active";
    byId("adminProductStock").value = "";
    byId("adminProductSummary").value = "";
    byId("adminProductColor").value = "case-onyx";
  }

  function fillAdminForm(product) {
    byId("adminProductId").value = product.id;
    byId("adminProductName").value = product.name;
    byId("adminProductCategory").value = product.category;
    byId("adminProductPrice").value = product.basePrice;
    byId("adminProductStatus").value = product.status;
    byId("adminProductStock").value = product.stockQuantity;
    byId("adminProductSummary").value = product.summary;
    byId("adminProductColor").value = product.colorClass;
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
    fillAdminForm,
    resetAdminForm,
  };
})();
