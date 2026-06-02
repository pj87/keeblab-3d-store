(function registerEvents() {
  const {
    addCurrentBuildToCart,
    byId,
    changeCartQuantity,
    createOrderFromCart,
    deleteProduct,
    loadConfiguration,
    persistState,
    quickAddProduct,
    removeCartItem,
    saveCurrentConfiguration,
    state,
    upsertProduct,
  } = window.KeebLabStore;

  const {
    closeCart,
    openCart,
    renderCart,
    renderConfigurator,
    renderAdmin,
    renderOrders,
    renderProducts,
    renderProductSelect,
    renderSavedConfigs,
    renderWebGpuStatus,
    fillAdminForm,
    resetAdminForm,
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
        location.hash = "builder";
      }

      if (quickAddButton) {
        const productId = quickAddProduct(quickAddButton.dataset.quickAdd);
        if (!productId) return;
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
      const code = addCurrentBuildToCart();
      if (!code) {
        byId("checkoutState").textContent = "Create a keyboard product before adding a build.";
        openCart();
        return;
      }
      byId("checkoutState").textContent = "";
      renderCart();
      openCart();
    });

    byId("saveConfig").addEventListener("click", () => {
      const code = saveCurrentConfiguration();
      if (!code) return;
      persistState();
      renderSavedConfigs();
      byId("checkoutState").textContent = `Saved ${code} locally.`;
      location.hash = "account";
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
      const result = createOrderFromCart();
      if (!result.ok) {
        byId("checkoutState").textContent = result.message;
        return;
      }

      renderCart();
      renderOrders();
      renderProducts();
      renderProductSelect();
      renderConfigurator();
      renderAdmin();
      persistState();
      byId("checkoutState").textContent = `Checkout simulated. Order #${result.orderId} created.`;
    });

    byId("savedConfigList").addEventListener("click", (event) => {
      const button = event.target.closest("[data-load-config]");
      if (!button) return;
      loadConfiguration(Number(button.dataset.loadConfig));
      renderConfigurator();
      location.hash = "builder";
    });

    byId("adminProductForm").addEventListener("submit", (event) => {
      event.preventDefault();
      upsertProduct({
        id: byId("adminProductId").value,
        name: byId("adminProductName").value,
        category: byId("adminProductCategory").value,
        basePrice: byId("adminProductPrice").value,
        status: byId("adminProductStatus").value,
        stockQuantity: byId("adminProductStock").value,
        summary: byId("adminProductSummary").value,
        colorClass: byId("adminProductColor").value,
      });
      persistState();
      renderAdmin();
      renderProducts();
      renderProductSelect();
      renderConfigurator();
      resetAdminForm();
    });

    byId("adminResetForm").addEventListener("click", resetAdminForm);

    byId("adminTable").addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-product]");
      const deleteButton = event.target.closest("[data-delete-product]");

      if (editButton) {
        const product = state.products.find((item) => item.id === editButton.dataset.editProduct);
        if (product) fillAdminForm(product);
      }

      if (deleteButton) {
        deleteProduct(deleteButton.dataset.deleteProduct);
        persistState();
        renderAdmin();
        renderProducts();
        renderProductSelect();
        renderConfigurator();
        renderCart();
      }
    });
  }

  window.KeebLabEvents = {
    bindEvents,
  };
})();
