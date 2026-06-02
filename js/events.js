(function registerEvents() {
  const {
    addCurrentBuildToCart,
    byId,
    changeCartQuantity,
    createOrderFromCart,
    loadConfiguration,
    persistState,
    quickAddProduct,
    removeCartItem,
    saveCurrentConfiguration,
    state,
  } = window.KeebLabStore;

  const {
    closeCart,
    openCart,
    renderCart,
    renderConfigurator,
    renderOrders,
    renderProducts,
    renderSavedConfigs,
    renderWebGpuStatus,
  } = window.KeebLabUI;

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
        quickAddProduct(quickAddButton.dataset.quickAdd);
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

    byId("addToCart").addEventListener("click", () => {
      addCurrentBuildToCart();
      byId("checkoutState").textContent = "";
      renderCart();
      openCart();
    });

    byId("saveConfig").addEventListener("click", () => {
      const code = saveCurrentConfiguration();
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
        changeCartQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.delta));
        renderCart();
        return;
      }

      const button = event.target.closest("[data-remove]");
      if (!button) return;
      removeCartItem(Number(button.dataset.remove));
      renderCart();
    });

    byId("checkoutButton").addEventListener("click", () => {
      const orderId = createOrderFromCart();
      if (!orderId) {
        byId("checkoutState").textContent = "Add a build before checkout.";
        return;
      }

      renderCart();
      renderOrders();
      persistState();
      byId("checkoutState").textContent = `Checkout simulated. Order #${orderId} created.`;
    });

    byId("savedConfigList").addEventListener("click", (event) => {
      const button = event.target.closest("[data-load-config]");
      if (!button) return;
      loadConfiguration(Number(button.dataset.loadConfig));
      renderConfigurator();
      location.hash = "configurator";
    });
  }

  window.KeebLabEvents = {
    bindEvents,
  };
})();
