# KeebLab — Full-Stack 3D E-Commerce Project Plan

## Project Concept

Build a full-stack e-commerce application with interactive 3D product presentation.

The recommended project is:

```text
KeebLab — 3D Mechanical Keyboard Store
```

This project combines:

```text
e-commerce
+ full-stack web development
+ product catalog
+ cart and checkout flow
+ user accounts
+ admin panel
+ 3D product viewer
+ optional WebGPU extension
```

The strategic goal is to learn practical full-stack web development through a visually impressive product.

---

## Recommended GitHub Repository Names

### Best Final Choices

```text
keeblab-3d-store
keeblab
keeblab-store
keeblab-configurator
fullstack-3d-commerce
```

### Recommended Main Choice

```text
keeblab-3d-store
```

Why:

```text
- short
- memorable
- specific
- portfolio-friendly
- clearly communicates 3D e-commerce
```

### Alternative Product-Like Names

```text
keebforge
keebcraft
keebstudio
switchlab-store
boardsmith-3d
keycap-lab
```

### More Descriptive GitHub Names

```text
nextjs-3d-commerce
nextjs-3d-product-store
react-three-commerce
threejs-product-configurator
keyboard-configurator
mechanical-keyboard-store
custom-keyboard-store
```

### Recommended GitHub Description

```text
Full-stack 3D e-commerce application for customizable mechanical keyboards, built with Next.js, TypeScript, PostgreSQL, Prisma, Tailwind CSS, React Three Fiber, and an experimental WebGPU viewer.
```

### Suggested GitHub Topics

```text
nextjs
typescript
react
postgresql
prisma
tailwindcss
threejs
react-three-fiber
ecommerce
3d
webgpu
fullstack
stripe
portfolio
```

---

## MVP Scope

The MVP should include:

```text
- homepage
- product listing
- product detail page
- 3D product viewer
- variant selector
- cart
- fake checkout or Stripe test mode
- user account
- order history
- admin panel
- PostgreSQL database
- deployment
```

The MVP does not need:

```text
- real inventory synchronization
- invoices
- shipping provider integration
- discount engine
- multi-currency support
- product reviews
- recommendations
- warehouse logic
- complex CMS
```

---

## Recommended Stack

Use a practical modern stack:

```text
Next.js
TypeScript
React
PostgreSQL
Prisma or Drizzle
Tailwind CSS
React Three Fiber
Drei
Stripe test mode or fake checkout
Auth.js or custom cookie sessions
UploadThing / Cloudinary / S3-compatible storage
Vercel + Neon/Supabase/Railway
```

Recommended fast stack:

```text
Next.js
TypeScript
Prisma
PostgreSQL
Tailwind CSS
React Three Fiber
Drei
Stripe test mode
UploadThing
Vercel
Neon
```

---

## 3D Strategy

### MVP Approach

Use:

```text
React Three Fiber + Drei
```

This gives fast access to:

```text
glTF/GLB loading
orbit controls
lighting
materials
environment maps
loading states
camera helpers
```

This is the pragmatic choice for a full-stack e-commerce project.

### WebGPU Extension

Do not make the whole MVP depend on a custom WebGPU renderer.

Instead, add WebGPU as an advanced feature:

```text
Experimental WebGPU Viewer
```

or:

```text
WebGPU Material Preview
```

Recommended product page tabs:

```text
Standard 3D Viewer
Experimental WebGPU Viewer
```

Standard viewer:

```text
React Three Fiber
stable
feature-complete
good UX
```

Experimental viewer:

```text
custom WebGPU
low-level graphics showcase
limited but technically impressive
```

---

## Domain Model

Minimal entities:

```text
User
Product
ProductVariant
ProductAsset
Cart
CartItem
Order
OrderItem
```

Optional later entities:

```text
SavedConfiguration
Category
Address
Payment
Review
AdminAuditLog
```

---

## Example Database Schema

### User

```text
id
email
passwordHash
role
createdAt
updatedAt
```

Roles:

```text
customer
admin
```

### Product

```text
id
name
slug
description
basePrice
category
isActive
createdAt
updatedAt
```

### ProductVariant

```text
id
productId
name
color
material
layout
switchType
priceDelta
sku
stockQuantity
createdAt
updatedAt
```

### ProductAsset

```text
id
productId
type
url
format
fileSize
createdAt
```

Asset types:

```text
model3d
thumbnail
texture
environment
galleryImage
```

Asset formats:

```text
glb
gltf
webp
png
jpg
ktx2
hdr
```

### Cart

```text
id
userId
anonymousSessionId
createdAt
updatedAt
```

### CartItem

```text
id
cartId
productId
variantId
quantity
unitPrice
configurationJson
createdAt
updatedAt
```

### Order

```text
id
userId
status
totalAmount
createdAt
updatedAt
```

Order statuses:

```text
pending
paid
cancelled
fulfilled
```

### OrderItem

```text
id
orderId
productId
variantId
quantity
unitPrice
configurationJson
createdAt
```

### SavedConfiguration

```text
id
userId
productId
name
configurationJson
publicSlug
createdAt
updatedAt
```

---

## Main Routes

### Public Routes

```text
/
/products
/products/[slug]
/cart
/checkout
/order/success
```

### User Routes

```text
/account
/account/orders
/account/orders/[id]
/account/configurations
```

### Admin Routes

```text
/admin
/admin/products
/admin/products/new
/admin/products/[id]
/admin/orders
/admin/assets
```

---

## Product Page Requirements

The product page is the most important page in the project.

It should include:

```text
- 3D viewer
- product title
- price
- variant selector
- color/material selector
- add to cart button
- product description
- technical specs
- gallery thumbnails
- loading state for the 3D model
- fallback image if 3D is unavailable
```

Key component:

```text
<ProductViewer3D />
```

Suggested component API:

```ts
type ProductViewer3DProps = {
  modelUrl: string;
  selectedColor?: string;
  selectedMaterial?: string;
  environmentUrl?: string;
  autoRotate?: boolean;
};
```

Optional advanced component:

```text
<ExperimentalWebGPUViewer />
```

---

## Implementation Milestones

### Milestone 1: Static Storefront

Build:

```text
homepage
product listing
product detail page
mock products
responsive layout
```

Deliverable:

```text
A static storefront with mock product data.
```

---

### Milestone 2: 3D Product Viewer

Build:

```text
load GLB model
orbit controls
lighting
environment
loading state
fallback image
variant color/material changes
```

Deliverable:

```text
A product page with an interactive 3D model.
```

---

### Milestone 3: Database

Build:

```text
products table
variants table
assets table
product detail from database
seed script
```

Deliverable:

```text
Products are loaded from PostgreSQL.
```

---

### Milestone 4: Cart

Build:

```text
add to cart
remove from cart
change quantity
cart persistence
cart totals
variant-aware cart items
```

Start with local storage if needed, then move to database-backed carts.

Deliverable:

```text
Users can add configured products to cart.
```

---

### Milestone 5: Authentication

Build:

```text
register
login
logout
account page
order history
admin role
```

Deliverable:

```text
Users can create accounts and access private account pages.
```

---

### Milestone 6: Checkout

Build:

```text
checkout form
fake payment or Stripe test mode
create order
order success page
order history
```

Deliverable:

```text
Users can complete a simulated or test-mode purchase.
```

---

### Milestone 7: Admin Panel

Build:

```text
create product
edit product
manage variants
upload model
manage product assets
view orders
```

Deliverable:

```text
Admins can manage the product catalog.
```

---

### Milestone 8: Polish and Deployment

Build:

```text
loading states
empty states
error states
SEO metadata
OpenGraph metadata
lazy loading
performance optimization
tests
README
screenshots
deployment
demo video or GIF
```

Deliverable:

```text
A public, portfolio-grade full-stack 3D e-commerce application.
```

---

## WebGPU Integration Options

### Option 1: WebGPU-Only Product Viewer

This is the most ambitious option.

Scope:

```text
GLB loading
camera
lights
PBR-like material
textures
environment map
tone mapping
```

Risk:

```text
This may grow into a full custom renderer and slow down the full-stack learning goal.
```

Recommended only after the main store is working.

---

### Option 2: WebGPU Configurator Effect

Use Three.js for the main viewer, but add WebGPU for a specific feature:

```text
procedural material preview
GPU-generated texture
particle background
custom lighting effect
product-specific simulation
```

This is a good compromise.

---

### Option 3: Experimental Renderer Tab

Best compromise.

Add tabs on the product page:

```text
Standard 3D Viewer
Experimental WebGPU Viewer
```

Recommended approach:

```text
MVP: React Three Fiber product viewer
Advanced: Experimental WebGPU viewer tab
```

---

## Best Product Theme: Mechanical Keyboard Configurator

Recommended product:

```text
mechanical keyboards
```

Why:

```text
- natural variant system
- case color
- keycaps
- switches
- layout
- material choices
- visually understandable in 3D
- not too organic or complex to model
- good technical audience fit
```

Possible product categories:

```text
custom keyboards
keycap sets
switches
keyboard cases
desk mats
cables
```

Main flagship product:

```text
custom mechanical keyboard
```

Possible configuration options:

```text
layout: 60%, 65%, 75%, TKL
case color: black, white, silver, navy
case material: plastic, aluminum
switch type: linear, tactile, clicky
keycap set: classic, retro, dark, neon
lighting: none, white, RGB
```

---

## Suggested README Structure

```text
# KeebLab — Full-Stack 3D Keyboard Store

## Overview
## Features
## Tech Stack
## Screenshots
## Demo
## 3D Viewer
## WebGPU Experimental Mode
## Database Schema
## Local Development
## Environment Variables
## Running Migrations
## Running Tests
## Deployment
## Roadmap
## License
```

Recommended README description:

```text
KeebLab is a full-stack 3D e-commerce application for customizable mechanical keyboards. It includes a product catalog, interactive 3D product viewer, configurable variants, cart, checkout flow, user accounts, admin panel, and an experimental WebGPU viewer mode.
```

---

## Suggested Commit Milestones

```text
init nextjs project
add storefront layout
add product catalog
add product detail page
add 3d product viewer
add product variants
add database schema
add product seed data
add cart flow
add authentication
add checkout flow
add admin product management
add asset upload
add experimental webgpu viewer
add tests
add deployment config
add readme and screenshots
```

---

## Suggested Branch Names

```text
main
dev
feature/storefront
feature/product-catalog
feature/product-viewer-3d
feature/cart
feature/auth
feature/checkout
feature/admin-panel
feature/webgpu-viewer
feature/deployment
```

---

## Final Recommendation

```text
Repository name:
keeblab-3d-store

Project title:
KeebLab — Full-Stack 3D Keyboard Store

Description:
Full-stack 3D e-commerce application for customizable mechanical keyboards, built with Next.js, TypeScript, PostgreSQL, Prisma, Tailwind CSS, React Three Fiber, and an experimental WebGPU viewer.
```

MVP:

```text
- product catalog
- product page
- 3D viewer
- variant selector
- cart
- checkout simulation
- auth
- order history
- admin product CRUD
- PostgreSQL
- deployment
```

Advanced:

```text
- experimental WebGPU material preview
- saved configurations
- shareable configuration URLs
- product asset upload
- Stripe test mode
```
