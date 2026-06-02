(function bootKeebLab() {
  const { loadState } = window.KeebLabStore;
  const { bindEvents } = window.KeebLabEvents;
  const { renderRoute } = window.KeebLabRouter;
  const {
    renderAdmin,
    renderCart,
    renderConfigurator,
    renderOrders,
    renderProducts,
    renderProductSelect,
    renderSavedConfigs,
  } = window.KeebLabUI;

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
    renderRoute();
  }

  init();
})();
