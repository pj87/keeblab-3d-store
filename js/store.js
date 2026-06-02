(function registerStore() {
  const { defaultOrders, optionSets, products: seedProducts } = window.KeebLabData;
  const storageKey = "keeblab-store-state";
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  function normalizeProduct(product) {
    const stockQuantity = Number(product.stockQuantity);
    const hasStockQuantity = Object.prototype.hasOwnProperty.call(product, "stockQuantity");
    return {
      ...product,
      stockQuantity: hasStockQuantity && Number.isFinite(stockQuantity) ? Math.max(0, stockQuantity) : 10,
    };
  }

  function normalizeCartItem(item) {
    const product = state.products.find((candidate) => candidate.id === item.productId)
      || state.products.find((candidate) => candidate.id === item.configuration?.productId)
      || state.products.find((candidate) => item.code === candidate.id.toUpperCase());
    return {
      ...item,
      productId: item.productId || product?.id,
    };
  }

  const state = {
    category: "all",
    search: "",
    productId: seedProducts[0].id,
    products: seedProducts.map(normalizeProduct),
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
    return state.products.find((product) => product.id === state.productId && canConfigureProduct(product))
      || state.products.find(canConfigureProduct)
      || null;
  }

  function isActiveProduct(product) {
    return product.status === "Active";
  }

  function hasStock(product) {
    return Number(product.stockQuantity) > 0;
  }

  function canConfigureProduct(product) {
    return product.category === "keyboards" && isActiveProduct(product) && hasStock(product);
  }

  function canBuyProduct(product) {
    return isActiveProduct(product) && hasStock(product);
  }

  function selected(set, id) {
    return optionSets[set].find((option) => option.id === id);
  }

  function buildCode() {
    const product = selectedProduct();
    if (!product) return "NO-PRODUCT";
    const layout = selected("layouts", state.layout);
    const color = selected("colors", state.color);
    const switches = selected("switches", state.switches);
    const keycaps = selected("keycaps", state.keycaps);
    return `${product.name.replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase()}-${layout.code}-${color.code}-${switches.code}-${keycaps.code}`;
  }

  function totalPrice() {
    const product = selectedProduct();
    if (!product) return 0;
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
      state.products = Array.isArray(saved.products) && saved.products.length ? saved.products.map(normalizeProduct) : state.products;
      state.productId = state.products.some((product) => product.id === state.productId && canConfigureProduct(product)) ? state.productId : state.products.find(canConfigureProduct)?.id;
      state.cart = Array.isArray(saved.cart) ? saved.cart.map(normalizeCartItem) : [];
      state.savedConfigs = Array.isArray(saved.savedConfigs) ? saved.savedConfigs : [];
      state.orders = Array.isArray(saved.orders) && saved.orders.length ? saved.orders : state.orders;
    } catch {
      localStorage.removeItem(storageKey);
    }
  }

  function persistState() {
    localStorage.setItem(storageKey, JSON.stringify({
      cart: state.cart,
      products: state.products,
      savedConfigs: state.savedConfigs,
      orders: state.orders,
    }));
  }

  function addCurrentBuildToCart() {
    const product = selectedProduct();
    if (!product || !canBuyProduct(product)) return null;
    const code = buildCode();
    const existing = state.cart.find((item) => item.code === code);

    if (existing) {
      existing.quantity += 1;
      return code;
    }

    state.cart.push({
      productName: product.name,
      productId: product.id,
      code,
      unitPrice: totalPrice(),
      quantity: 1,
      configuration: currentConfiguration(),
    });
    return code;
  }

  function quickAddProduct(productId) {
    const product = state.products.find((item) => item.id === productId);
    if (!product || !canBuyProduct(product)) return null;
    state.cart.push({
      productName: product.name,
      productId: product.id,
      code: product.id.toUpperCase(),
      unitPrice: product.basePrice,
      quantity: 1,
    });
    return product.id;
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
    if (!product) return null;
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
    if (!state.cart.length) {
      return { ok: false, message: "Add a build before checkout." };
    }
    const unavailable = state.cart.find((item) => {
      const product = state.products.find((candidate) => candidate.id === item.productId);
      return !product || !canBuyProduct(product) || product.stockQuantity < item.quantity;
    });
    if (unavailable) {
      return { ok: false, message: `${unavailable.productName} does not have enough stock.` };
    }
    const orderId = `KL-${Math.floor(1100 + Math.random() * 8900)}`;
    const total = state.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    state.orders.unshift({
      id: orderId,
      items: state.cart.map((item) => item.productName).join(", "),
      status: "Paid",
      total,
    });
    state.cart.forEach((item) => {
      const product = state.products.find((candidate) => candidate.id === item.productId);
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
    });
    state.cart = [];
    return { ok: true, orderId };
  }

  function slugify(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function upsertProduct(productInput) {
    const id = productInput.id || slugify(productInput.name);
    const product = {
      id,
      name: productInput.name.trim(),
      category: productInput.category,
      summary: productInput.summary.trim(),
      basePrice: Number(productInput.basePrice),
      colorClass: productInput.colorClass,
      status: productInput.status,
      stockQuantity: Math.max(0, Number(productInput.stockQuantity)),
    };
    const index = state.products.findIndex((item) => item.id === id);
    if (index >= 0) {
      state.products[index] = product;
    } else {
      state.products.unshift(product);
    }
    if (!state.products.some((item) => item.id === state.productId && canConfigureProduct(item))) {
      const firstKeyboard = state.products.find(canConfigureProduct);
      if (firstKeyboard) state.productId = firstKeyboard.id;
    }
    return product;
  }

  function deleteProduct(productId) {
    const index = state.products.findIndex((product) => product.id === productId);
    if (index < 0) return;
    state.products.splice(index, 1);
    state.cart = state.cart.filter((item) => item.code !== productId.toUpperCase());
    if (state.productId === productId) {
      const firstKeyboard = state.products.find(canConfigureProduct);
      state.productId = firstKeyboard ? firstKeyboard.id : state.products[0]?.id;
    }
  }

  window.KeebLabStore = {
    addCurrentBuildToCart,
    buildCode,
    byId,
    changeCartQuantity,
    createOrderFromCart,
    canBuyProduct,
    canConfigureProduct,
    deleteProduct,
    formatDelta,
    formatMoney,
    loadConfiguration,
    loadState,
    optionSets,
    persistState,
    quickAddProduct,
    removeCartItem,
    saveCurrentConfiguration,
    selected,
    selectedProduct,
    state,
    totalPrice,
    upsertProduct,
  };
})();
