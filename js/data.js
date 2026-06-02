(function registerData() {
  const products = [
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

  const defaultOrders = [
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
  ];

  window.KeebLabData = {
    defaultOrders,
    optionSets,
    products,
  };
})();
