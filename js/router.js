(function registerRouter() {
  const routeMap = {
    "": "home",
    account: "account",
    admin: "admin",
    builder: "builder",
    catalog: "catalog",
    configurator: "builder",
    home: "home",
    orders: "account",
    storefront: "home",
  };

  function currentRoute() {
    const hash = window.location.hash.replace("#", "");
    return routeMap[hash] || "home";
  }

  function renderRoute() {
    const route = currentRoute();
    document.querySelectorAll("[data-view]").forEach((view) => {
      view.classList.toggle("active-view", view.dataset.view === route);
    });
    document.querySelectorAll("[data-route-link]").forEach((link) => {
      link.classList.toggle("active-route", link.dataset.routeLink === route);
    });
    document.querySelectorAll("[data-account-admin-shell]").forEach((shell) => {
      shell.classList.toggle("active-shell", route === "account" || route === "admin");
    });
    document.body.dataset.route = route;
  }

  window.addEventListener("hashchange", renderRoute);

  window.KeebLabRouter = {
    renderRoute,
  };
})();
