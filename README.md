# KeebLab

KeebLab is a 3D mechanical keyboard store project. The first milestone is a dependency-free static storefront with mock products, a configurable keyboard detail view, cart behavior, account/order previews, and an admin catalog preview.

## Run Locally

Install dependencies and start Next.js:

```powershell
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Current Scope

- Next.js storefront
- Persisted product catalog with admin create/edit/delete
- Inventory-aware products with checkout stock decrement
- Product catalog filtering and search
- Product configurator with layout, color, switch, and keycap options
- Cart drawer and simulated checkout
- Account order preview
- Admin catalog preview

## JavaScript Structure

- `js/data.js` contains mock catalog and option data
- `js/store.js` owns state, selectors, cart actions, saved configurations, orders, and persistence
- `js/ui.js` renders DOM views from state
- `js/router.js` controls hash-based app views
- `js/events.js` binds user interactions
- `webgl-keyboard.js` owns the native WebGL product viewer
- `app.js` boots the storefront

## Roadmap

- Move the storefront into Next.js and TypeScript
- Add React Three Fiber product viewer
- Add database-backed products with Prisma and PostgreSQL
- Add authentication, order history, checkout, and admin CRUD
- Add experimental WebGPU viewer mode
