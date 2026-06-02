"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Category = "keyboards" | "parts";
type Status = "Active" | "Draft";
type Route = "home" | "catalog" | "builder" | "account" | "admin";

type Product = {
  id: string;
  name: string;
  category: Category;
  summary: string;
  basePrice: number;
  colorClass: string;
  status: Status;
  stockQuantity: number;
};

type CartItem = {
  productId?: string;
  productName: string;
  code: string;
  unitPrice: number;
  quantity: number;
  configuration?: Configuration;
};

type Order = {
  id: string;
  items: string;
  status: "Paid" | "Fulfilled";
  total: number;
};

type Configuration = {
  productId: string;
  layout: string;
  color: string;
  switches: string;
  keycaps: string;
};

type SavedConfiguration = {
  code: string;
  productName: string;
  price: number;
  configuration: Configuration;
};

type AdminForm = {
  id: string;
  name: string;
  category: Category;
  basePrice: string;
  status: Status;
  stockQuantity: string;
  summary: string;
  colorClass: string;
};

const storageKey = "keeblab-store-state";

const seedProducts: Product[] = [
  {
    id: "kl-75-aurora",
    name: "KL-75 Aurora",
    category: "keyboards",
    summary: "Premium 75% aluminum keyboard with hot-swap PCB and gasket mount.",
    basePrice: 219,
    colorClass: "case-onyx",
    status: "Active",
    stockQuantity: 8,
  },
  {
    id: "kl-65-phantom",
    name: "KL-65 Phantom",
    category: "keyboards",
    summary: "Compact wireless 65% board with quiet dampening and low-latency mode.",
    basePrice: 179,
    colorClass: "case-forest",
    status: "Active",
    stockQuantity: 5,
  },
  {
    id: "kl-tkl-forge",
    name: "KL-TKL Forge",
    category: "keyboards",
    summary: "Tournament TKL build with hot-swap PCB and reinforced aluminum plate.",
    basePrice: 199,
    colorClass: "case-clay",
    status: "Active",
    stockQuantity: 3,
  },
  {
    id: "retro-keycaps",
    name: "Retro Keycap Set",
    category: "parts",
    summary: "Doubleshot PBT profile with warm legends and broad layout support.",
    basePrice: 69,
    colorClass: "case-silver",
    status: "Draft",
    stockQuantity: 12,
  },
];

const defaultOrders: Order[] = [
  { id: "KL-1024", items: "KL-65 Phantom, Desk Mat", status: "Paid", total: 248 },
  { id: "KL-1018", items: "Retro Keycap Set", status: "Fulfilled", total: 69 },
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

const emptyAdminForm: AdminForm = {
  id: "",
  name: "",
  category: "keyboards",
  basePrice: "",
  status: "Active",
  stockQuantity: "",
  summary: "",
  colorClass: "case-onyx",
};

const formatMoney = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format(value);

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function KeyboardPreview({ colorClass = "case-onyx" }: { colorClass?: string }) {
  return (
    <div className="keyboard-scene" aria-hidden="true">
      <div className={`keyboard-case ${colorClass}`}>
        {Array.from({ length: 40 }).map((_, index) => (
          <span
            key={index}
            className={`key ${index % 7 === 0 ? "dark" : ""} ${index % 11 === 0 ? "accent" : ""} ${index === 28 || index === 33 || index === 38 ? "wide" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

function useWebGlKeyboard(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  selectedProduct: Product | null,
  configuration: Omit<Configuration, "productId">,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animation = 0;
    const color = optionSets.colors.find((item) => item.id === configuration.color)?.value || "#111820";

    function draw() {
      if (!ctx || !canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#10151c";
      ctx.fillRect(0, 0, width, height);

      animation += 0.01;
      const centerX = width / 2;
      const centerY = height / 2 + 20;
      const boardWidth = Math.min(width * 0.72, 640);
      const boardHeight = boardWidth / 2.35;
      const skew = Math.sin(animation) * 12;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.18);
      ctx.transform(1, -0.22, 0.45, 0.82, 0, 0);
      ctx.fillStyle = color;
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 2;
      ctx.roundRect(-boardWidth / 2 + skew, -boardHeight / 2, boardWidth, boardHeight, 24);
      ctx.fill();
      ctx.stroke();

      const columns = configuration.layout === "full" ? 18 : configuration.layout === "tkl" ? 16 : configuration.layout === "65" ? 12 : 14;
      const rows = 4;
      const gap = 8;
      const keyW = (boardWidth - 64 - gap * columns) / columns;
      const keyH = (boardHeight - 54 - gap * rows) / rows;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
          const index = row * columns + col;
          ctx.fillStyle = index % 7 === 0 ? "#0b0f14" : index % 11 === 0 ? "#8fd14f" : "#dce3e8";
          ctx.roundRect(
            -boardWidth / 2 + 28 + col * (keyW + gap),
            -boardHeight / 2 + 24 + row * (keyH + gap),
            keyW,
            keyH,
            5,
          );
          ctx.fill();
        }
      }
      ctx.restore();

      ctx.fillStyle = "rgba(238,242,245,0.7)";
      ctx.font = "13px system-ui";
      ctx.fillText(selectedProduct ? selectedProduct.name : "No keyboard selected", 18, 28);

      frame = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(frame);
  }, [canvasRef, configuration.color, configuration.layout, selectedProduct]);
}

export default function Storefront() {
  const [route, setRoute] = useState<Route>("home");
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [category, setCategory] = useState<"all" | Category>("all");
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState(seedProducts[0].id);
  const [layout, setLayout] = useState("75");
  const [color, setColor] = useState("onyx");
  const [switches, setSwitches] = useState("linear-red");
  const [keycaps, setKeycaps] = useState("dark-pbt");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(defaultOrders);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [adminForm, setAdminForm] = useState<AdminForm>(emptyAdminForm);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedProduct = useMemo(() => (
    products.find((product) => product.id === productId && product.category === "keyboards" && product.status === "Active" && product.stockQuantity > 0)
    || products.find((product) => product.category === "keyboards" && product.status === "Active" && product.stockQuantity > 0)
    || null
  ), [productId, products]);

  useWebGlKeyboard(canvasRef, selectedProduct, { layout, color, switches, keycaps });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as {
        products?: Product[];
        cart?: CartItem[];
        orders?: Order[];
        savedConfigs?: SavedConfiguration[];
      };
      if (parsed.products?.length) setProducts(parsed.products.map((product) => ({ ...product, stockQuantity: product.stockQuantity ?? 10 })));
      if (parsed.cart) setCart(parsed.cart);
      if (parsed.orders?.length) setOrders(parsed.orders);
      if (parsed.savedConfigs) setSavedConfigs(parsed.savedConfigs);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ products, cart, orders, savedConfigs }));
  }, [products, cart, orders, savedConfigs]);

  const activeProducts = products.filter((product) => {
    if (product.status !== "Active") return false;
    const matchesCategory = category === "all" || product.category === category;
    const matchesSearch = `${product.name} ${product.summary}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    return selectedProduct.basePrice
      + optionSets.layouts.find((item) => item.id === layout)!.delta
      + optionSets.switches.find((item) => item.id === switches)!.delta
      + optionSets.keycaps.find((item) => item.id === keycaps)!.delta;
  }, [keycaps, layout, selectedProduct, switches]);

  const buildCode = useMemo(() => {
    if (!selectedProduct) return "NO-PRODUCT";
    return `${selectedProduct.name.replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase()}-${layout}-${color}-${switches.slice(0, 2).toUpperCase()}-${keycaps.slice(0, 2).toUpperCase()}`;
  }, [color, keycaps, layout, selectedProduct, switches]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  function navigate(nextRoute: Route) {
    setRoute(nextRoute);
  }

  function addCurrentBuildToCart() {
    if (!selectedProduct) {
      setCheckoutState("Create an active keyboard product with stock first.");
      setCartOpen(true);
      return;
    }
    setCart((items) => {
      const existing = items.find((item) => item.code === buildCode);
      if (existing) {
        return items.map((item) => item.code === buildCode ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [
        ...items,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          code: buildCode,
          unitPrice: totalPrice,
          quantity: 1,
          configuration: { productId: selectedProduct.id, layout, color, switches, keycaps },
        },
      ];
    });
    setCartOpen(true);
  }

  function quickAddProduct(product: Product) {
    if (product.stockQuantity <= 0 || product.status !== "Active") return;
    setCart((items) => [...items, {
      productId: product.id,
      productName: product.name,
      code: product.id.toUpperCase(),
      unitPrice: product.basePrice,
      quantity: 1,
    }]);
    setCartOpen(true);
  }

  function checkout() {
    if (!cart.length) {
      setCheckoutState("Add a build before checkout.");
      return;
    }
    const unavailable = cart.find((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return !product || product.status !== "Active" || product.stockQuantity < item.quantity;
    });
    if (unavailable) {
      setCheckoutState(`${unavailable.productName} does not have enough stock.`);
      return;
    }
    const orderId = `KL-${Math.floor(1100 + Math.random() * 8900)}`;
    setProducts((items) => items.map((product) => {
      const cartItem = cart.find((item) => item.productId === product.id);
      return cartItem ? { ...product, stockQuantity: Math.max(0, product.stockQuantity - cartItem.quantity) } : product;
    }));
    setOrders((items) => [{ id: orderId, items: cart.map((item) => item.productName).join(", "), status: "Paid", total: cartTotal }, ...items]);
    setCart([]);
    setCheckoutState(`Checkout simulated. Order #${orderId} created.`);
  }

  function saveConfiguration() {
    if (!selectedProduct) return;
    setSavedConfigs((items) => items.some((item) => item.code === buildCode) ? items : [{
      code: buildCode,
      productName: selectedProduct.name,
      price: totalPrice,
      configuration: { productId: selectedProduct.id, layout, color, switches, keycaps },
    }, ...items]);
    navigate("account");
  }

  function upsertProduct() {
    const id = adminForm.id || slugify(adminForm.name);
    const product: Product = {
      id,
      name: adminForm.name.trim(),
      category: adminForm.category,
      basePrice: Number(adminForm.basePrice),
      status: adminForm.status,
      stockQuantity: Math.max(0, Number(adminForm.stockQuantity)),
      summary: adminForm.summary.trim(),
      colorClass: adminForm.colorClass,
    };
    setProducts((items) => {
      const exists = items.some((item) => item.id === id);
      return exists ? items.map((item) => item.id === id ? product : item) : [product, ...items];
    });
    setAdminForm(emptyAdminForm);
  }

  function deleteProduct(productIdToDelete: string) {
    setProducts((items) => items.filter((item) => item.id !== productIdToDelete));
    setCart((items) => items.filter((item) => item.productId !== productIdToDelete));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand link-button" onClick={() => navigate("home")} type="button">
          <span className="brand-mark">K</span>
          <span>KeebLab</span>
        </button>
        <nav className="nav" aria-label="Main navigation">
          {(["catalog", "builder", "account", "admin"] as Route[]).map((item) => (
            <button key={item} className={route === item ? "active-route" : ""} onClick={() => navigate(item)} type="button">
              {item === "builder" ? "Build" : item === "account" ? "Orders" : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <label className="search-wrap" htmlFor="search">
            <span>Search</span>
            <input id="search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search keyboards, switches, keycaps" />
          </label>
          <button className="cart-button" onClick={() => setCartOpen(true)} type="button">
            <span>Cart</span>
            <strong>{cartCount}</strong>
          </button>
        </div>
      </header>

      <main>
        <section className={`hero-band app-view ${route === "home" ? "active-view" : ""}`}>
          <div className="hero-copy">
            <p className="eyebrow">Custom mechanical keyboards</p>
            <h1>KeebLab</h1>
            <p>Configure a board, inspect the build, and move from product choice to checkout without leaving the store.</p>
            <div className="hero-actions">
              <button className="button primary" onClick={() => navigate("builder")} type="button">Start a build</button>
              <button className="button" onClick={() => navigate("catalog")} type="button">Browse catalog</button>
            </div>
          </div>
          <div className="product-visual hero-visual">
            <KeyboardPreview />
            <div className="visual-footer">
              <span>75%</span><span>Aluminum</span><span>Hot-swap</span><span>RGB</span>
            </div>
          </div>
        </section>

        <section className={`section app-view ${route === "catalog" ? "active-view" : ""}`}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Catalog</p>
              <h2>Featured products</h2>
            </div>
            <div className="segmented">
              {(["all", "keyboards", "parts"] as const).map((item) => (
                <button key={item} className={`segment ${category === item ? "active" : ""}`} onClick={() => setCategory(item)} type="button">{item}</button>
              ))}
            </div>
          </div>
          <div className="product-grid">
            {activeProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-thumb"><div className={`mini-board ${product.colorClass}`} /></div>
                <div className="product-info">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.summary}</p>
                    <span className={`stock-pill ${product.stockQuantity > 0 ? "" : "empty"}`}>{product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Sold out"}</span>
                  </div>
                  <div className="price-row">
                    <span className="price">{formatMoney(product.basePrice)}</span>
                    <button
                      className="button"
                      disabled={product.stockQuantity <= 0}
                      onClick={() => product.category === "keyboards" ? (setProductId(product.id), navigate("builder")) : quickAddProduct(product)}
                      type="button"
                    >
                      {product.category === "keyboards" ? "Configure" : "Add"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`section configurator-layout app-view ${route === "builder" ? "active-view" : ""}`}>
          <div className="viewer-panel">
            <div className="panel-header">
              <span>{selectedProduct?.name || "No keyboard selected"}</span>
              <span className="stock-pill">{selectedProduct ? `${selectedProduct.stockQuantity} in stock` : "No stock"}</span>
            </div>
            <div className="webgl-viewer">
              <canvas ref={canvasRef} />
              <div className="viewer-hint">Canvas product preview</div>
            </div>
            <div className="viewer-meta">
              <span>React canvas</span><span>Configurator synced</span><span>Local storage catalog</span>
            </div>
          </div>
          <aside className="config-panel">
            <p className="eyebrow">Products / Keyboards / {selectedProduct?.id || "empty"}</p>
            <h2>{selectedProduct?.name || "Create a keyboard product"}</h2>
            <p className="product-summary">{selectedProduct?.summary || "Use the admin panel to add an active keyboard product."}</p>
            <div className="control-group">
              <div className="control-label"><span>Product</span><strong>{selectedProduct ? formatMoney(selectedProduct.basePrice) : "$0"}</strong></div>
              <select value={selectedProduct?.id || ""} onChange={(event) => setProductId(event.target.value)} disabled={!products.some((product) => product.category === "keyboards" && product.status === "Active" && product.stockQuantity > 0)}>
                {products.filter((product) => product.category === "keyboards" && product.status === "Active" && product.stockQuantity > 0).map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <OptionGroup title="Layout" options={optionSets.layouts} value={layout} onChange={setLayout} />
            <OptionGroup title="Switches" options={optionSets.switches} value={switches} onChange={setSwitches} />
            <OptionGroup title="Keycaps" options={optionSets.keycaps} value={keycaps} onChange={setKeycaps} />
            <div className="control-group">
              <div className="control-label"><span>Case color</span><strong>{optionSets.colors.find((item) => item.id === color)?.label}</strong></div>
              <div className="swatches">
                {optionSets.colors.map((item) => (
                  <button key={item.id} className={`swatch ${color === item.id ? "active" : ""}`} style={{ background: item.value }} onClick={() => setColor(item.id)} type="button" aria-label={item.label} />
                ))}
              </div>
            </div>
            <div className="summary-box">
              <div><span>Configured total</span><strong>{formatMoney(totalPrice)}</strong></div>
              <div><span>Build code</span><strong>{buildCode}</strong></div>
            </div>
            <div className="purchase-actions">
              <button className="button primary full" onClick={addCurrentBuildToCart} type="button">Add to cart</button>
              <button className="button full" onClick={saveConfiguration} type="button">Save configuration</button>
            </div>
          </aside>
        </section>

        <section className={`section app-view ${route === "account" ? "active-view" : ""}`}>
          <div className="section-heading"><div><p className="eyebrow">Account</p><h2>Order history</h2></div></div>
          <div className="order-list">
            {orders.map((order) => (
              <article key={order.id}><strong>#{order.id}</strong><span>{order.items} - {formatMoney(order.total)}</span><em>{order.status}</em></article>
            ))}
          </div>
          <div className="saved-configs">
            <div className="section-heading"><div><p className="eyebrow">Saved</p><h2>Configurations</h2></div></div>
            <div className="order-list">
              {savedConfigs.length ? savedConfigs.map((config) => (
                <article key={config.code}>
                  <strong>{config.code}</strong><span>{config.productName} - {formatMoney(config.price)}</span>
                  <button className="button" onClick={() => {
                    setProductId(config.configuration.productId);
                    setLayout(config.configuration.layout);
                    setColor(config.configuration.color);
                    setSwitches(config.configuration.switches);
                    setKeycaps(config.configuration.keycaps);
                    navigate("builder");
                  }} type="button">Load</button>
                </article>
              )) : <article><span>No saved configurations yet.</span></article>}
            </div>
          </div>
        </section>

        <section className={`section app-view ${route === "admin" ? "active-view" : ""}`}>
          <div className="section-heading"><div><p className="eyebrow">Admin</p><h2>Catalog controls</h2></div></div>
          <form className="admin-form" onSubmit={(event) => { event.preventDefault(); upsertProduct(); }}>
            <input value={adminForm.name} onChange={(event) => setAdminForm({ ...adminForm, name: event.target.value })} required placeholder="Name" />
            <select value={adminForm.category} onChange={(event) => setAdminForm({ ...adminForm, category: event.target.value as Category })}>
              <option value="keyboards">Keyboards</option><option value="parts">Parts</option>
            </select>
            <input value={adminForm.basePrice} onChange={(event) => setAdminForm({ ...adminForm, basePrice: event.target.value })} required min="1" type="number" placeholder="Price" />
            <select value={adminForm.status} onChange={(event) => setAdminForm({ ...adminForm, status: event.target.value as Status })}>
              <option value="Active">Active</option><option value="Draft">Draft</option>
            </select>
            <input value={adminForm.stockQuantity} onChange={(event) => setAdminForm({ ...adminForm, stockQuantity: event.target.value })} required min="0" type="number" placeholder="Stock" />
            <input className="admin-form-wide" value={adminForm.summary} onChange={(event) => setAdminForm({ ...adminForm, summary: event.target.value })} required placeholder="Summary" />
            <select value={adminForm.colorClass} onChange={(event) => setAdminForm({ ...adminForm, colorClass: event.target.value })}>
              <option value="case-onyx">Onyx</option><option value="case-silver">Silver</option><option value="case-forest">Forest</option><option value="case-clay">Clay</option>
            </select>
            <div className="admin-form-actions">
              <button className="button primary" type="submit">Save product</button>
              <button className="button" onClick={() => setAdminForm(emptyAdminForm)} type="button">New product</button>
            </div>
          </form>
          <div className="admin-table">
            <div className="admin-row header"><span>Product</span><span>Category</span><span>Status</span><span>Stock</span><span>Price</span><span>Actions</span></div>
            {products.map((product) => (
              <div className="admin-row" key={product.id}>
                <strong>{product.name}</strong><span>{product.category}</span><span>{product.status}</span><span>{product.stockQuantity}</span><span>{formatMoney(product.basePrice)}</span>
                <span className="admin-actions">
                  <button className="button" onClick={() => setAdminForm({ ...product, basePrice: String(product.basePrice), stockQuantity: String(product.stockQuantity) })} type="button">Edit</button>
                  <button className="button" onClick={() => deleteProduct(product.id)} type="button">Delete</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen}>
        <div className="cart-header">
          <div><p className="eyebrow">Cart</p><h2>Your build list</h2></div>
          <button className="icon-button" onClick={() => setCartOpen(false)} type="button">X</button>
        </div>
        <div className="cart-items">
          {cart.length ? cart.map((item, index) => (
            <div className="cart-line" key={`${item.code}-${index}`}>
              <div><strong>{item.productName}</strong><span>{item.code} - {item.quantity} x {formatMoney(item.unitPrice)}</span></div>
              <div className="quantity-controls">
                <button onClick={() => setCart((items) => items.flatMap((cartItem, cartIndex) => cartIndex === index ? cartItem.quantity <= 1 ? [] : [{ ...cartItem, quantity: cartItem.quantity - 1 }] : [cartItem]))} type="button">-</button>
                <strong>{item.quantity}</strong>
                <button onClick={() => setCart((items) => items.map((cartItem, cartIndex) => cartIndex === index ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem))} type="button">+</button>
                <button className="remove-line" onClick={() => setCart((items) => items.filter((_, cartIndex) => cartIndex !== index))} type="button">X</button>
              </div>
            </div>
          )) : <div className="cart-line"><span>Your cart is empty.</span></div>}
        </div>
        <div className="cart-total"><span>Total</span><strong>{formatMoney(cartTotal)}</strong></div>
        <button className="button primary full" onClick={checkout} type="button">Checkout</button>
        <p className="checkout-state">{checkoutState}</p>
      </aside>
      <div className={`scrim ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />
    </div>
  );
}

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { id: string; label: string; delta: number; code: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="control-group">
      <div className="control-label">
        <span>{title}</span>
        <strong>{options.find((item) => item.id === value)?.delta ? `+${formatMoney(options.find((item) => item.id === value)!.delta)}` : "+$0"}</strong>
      </div>
      <div className="option-grid">
        {options.map((option) => (
          <button key={option.id} className={`option ${value === option.id ? "active" : ""}`} onClick={() => onChange(option.id)} type="button">{option.label}</button>
        ))}
      </div>
    </div>
  );
}
