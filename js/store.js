(function registerStore() {
  const { defaultOrders, optionSets, products } = window.KeebLabData;
  const storageKey = "keeblab-store-state";
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

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
    orders: [...defaultOrders],
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function formatMoney(value) {
    return currency.format(value);
  }

  function formatDelta(value) {
    return value > 0 ? `+${formatMoney(value)}` : "+$0";
  }

  function selectedProduct() {
    return products.find((product) => product.id === state.productId);
  }

  function selected(set, id) {
    return optionSets[set].find((option) => option.id === id);
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

  function currentConfiguration() {
    return {
      productId: state.productId,
      layout: state.layout,
      color: state.color,
      switches: state.switches,
      keycaps: state.keycaps,
    };
  }

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

  function addCurrentBuildToCart() {
    const product = selectedProduct();
    const code = buildCode();
    const existing = state.cart.find((item) => item.code === code);

    if (existing) {
      existing.quantity += 1;
      return;
    }

    state.cart.push({
      productName: product.name,
      code,
      unitPrice: totalPrice(),
      quantity: 1,
      configuration: currentConfiguration(),
    });
  }

  function quickAddProduct(productId) {
    const product = products.find((item) => item.id === productId);
    state.cart.push({
      productName: product.name,
      code: product.id.toUpperCase(),
      unitPrice: product.basePrice,
      quantity: 1,
    });
  }

  function changeCartQuantity(index, delta) {
    const item = state.cart[index];
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart.splice(index, 1);
    }
  }

  function removeCartItem(index) {
    state.cart.splice(index, 1);
  }

  function saveCurrentConfiguration() {
    const product = selectedProduct();
    const code = buildCode();
    const existing = state.savedConfigs.find((config) => config.code === code);

    if (!existing) {
      state.savedConfigs.unshift({
        code,
        productName: product.name,
        price: totalPrice(),
        configuration: currentConfiguration(),
      });
    }

    return code;
  }

  function loadConfiguration(index) {
    const config = state.savedConfigs[index];
    if (!config) return;
    Object.assign(state, config.configuration);
  }

  function createOrderFromCart() {
    if (!state.cart.length) return null;
    const orderId = `KL-${Math.floor(1100 + Math.random() * 8900)}`;
    const total = state.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    state.orders.unshift({
      id: orderId,
      items: state.cart.map((item) => item.productName).join(", "),
      status: "Paid",
      total,
    });
    state.cart = [];
    return orderId;
  }

  window.KeebLabStore = {
    addCurrentBuildToCart,
    buildCode,
    byId,
    changeCartQuantity,
    createOrderFromCart,
    formatDelta,
    formatMoney,
    loadConfiguration,
    loadState,
    optionSets,
    persistState,
    products,
    quickAddProduct,
    removeCartItem,
    saveCurrentConfiguration,
    selected,
    selectedProduct,
    state,
    totalPrice,
  };
})();
