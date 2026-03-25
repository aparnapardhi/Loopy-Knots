# Loopy Knots - Technical Handoff & Architecture Document

This document contains the complete frontend architecture, file structure, dependencies, and instructions required to migrate or recreate the Loopy Knots E-Commerce and Admin platform in another IDE or AI development environment (e.g., Cursor, Windsurf, v0).

## 1. Project Overview
**Loopy Knots** is a high-conversion, professional e-commerce storefront specializing in handcrafted crochet items. It features a localized Indian checkout experience (Rupees, GST calculation), Shopify-like dynamic cart mechanics, interactive high-end branding, and a functional Admin CRM/Inventory dashboard.

**Tech Stack:**
*   **Core:** HTML5, Vanilla JavaScript, CSS3
*   **Styling:** Custom CSS with CSS Variables (`--cobalt: #1A53FF;`, `--admin-bg: #FDFBF7;`)
*   **Icons:** Lucide Icons (CDN)
*   **Animations:** Simplex Noise (`https://unpkg.com/simplex-noise/dist/umd/simplex-noise.min.js`) for the fluid, interactive hero background wave mesh.
*   **Data Persistence:** LocalStorage (`loopyProducts`, `loopyCart`) API used for mocking a backend database across Storefront and Admin views.

## 2. File Structure & Formats

The project is structured entirely using static files, requiring no build step for the live MVP.

```text
loopy-knots/
├── index.html                # Main E-Commerce Storefront
├── css/
│   └── style.css             # Main storefront styles, variables, and responsive breakpoints
├── js/
│   ├── main.js               # Storefront logic: Cart sliding, GST calc, slider init, localStorage sync
│   ├── slider.js             # High-performance infinite-scrolling logic for the product gallery
│   └── waves.js              # Advanced liquid-mesh background animation physics for the hero section
├── assets/                   # Image assets directory
│   ├── mascot_new.png        # High-res, floating hero mascot image
│   ├── logo.jpg              # Original logo
│   └── products/             # Directory for admin-uploaded product images
└── admin/                    # Admin Dashboard Sub-App
    ├── index.html            # Admin panel UI (Dashboard, Inventory, Orders, Customers)
    ├── admin.css             # Admin-specific styling
    └── admin.js              # Admin logic: Product CRUD, image upload processing, analytics rendering
```

## 3. Key Components & Implementation Details

*   **State Management:** Both `main.js` and `admin.js` parse the `loopyProducts` localStorage key. The Admin panel pushes new products (including base64 strings or paths for images) to this store, and the Storefront dynamically renders them in the `renderProducts()` function.
*   **Hero Interactive Waves (`waves.js`):** A custom class that uses `simplex-noise` and `requestAnimationFrame`. It draws an 8px high-density SVG mesh that dynamically deforms based on an invisible cursor force-field and a tracking `.pointer-dot`.
*   **Checkout & Indian Customization:** Situated in the cart drawer (`index.html` > `#checkoutModal`). Features standard cart summary + an intra-state/inter-state toggle that splits 18% GST into either 9% CGST + 9% SGST, or 18% IGST.
*   **Image Handling:** The admin panel (`admin/index.html` > `#addProdModal`) features a Drag & Drop zone that converts uploaded images to Base64 strings using the `FileReader` API for immediate frontend persistence.

---

## 4. AI-IDE Prompt for Project Replication/Continuation

If you open this repository in an Agentic AI IDE (like Cursor or another AI assistant) with an empty or fresh workspace, copy and paste the prompt below to instruct the AI to spin up the required file architecture identically to what we have built:

> **System Prompt for New IDE Agent:**
> "I am setting up the 'Loopy Knots' handcrafted crochet e-commerce store. I need you to recreate the static frontend architecture. 
> 
> Please create the following file structure directly in the root directory:
> 1. `index.html`: A modern e-commerce storefront with a specialized, dark-cobalt-blue (`#1A53FF`) theme, an interactive hero background, and a sliding cart drawer. Connect it to `css/style.css`, `js/waves.js`, `js/slider.js`, and `js/main.js`.
> 2. `admin/index.html`: An admin dashboard with a sidebar layout. It needs sections for Dashboard (with mock revenue charts), Orders, Inventory (with a Product Add/Edit modal supporting image uploads), and Customers. Connect it to `admin/admin.css` and `admin/admin.js`.
> 3. Implement `main.js` to handle a `localStorage` based database referencing a key called `loopyProducts`. The store should fetch products from here and render them.
> 4. Implement `admin/admin.js` to handle full CRUD operations pushing to the `loopyProducts` localStorage key. Adding a product should use a FileReader to safely store base64 images.
> 5. Ensure the styling uses Lucide icons via CDN plugin, and standard Google Fonts ('Outfit'). 
> 
> Please execute these files ensuring high quality structure."

## 5. Running the Application

Because this uses pure vanilla web technologies:
1.  **Local IDE preview:** Open `index.html` via any Live Server extension (e.g., VS Code Live Server).
2.  **Navigation:** To access the admin panel, simply open `/admin/index.html`, or click the "Admin Panel" link in the storefront header.
3.  **Cross-Origin Considerations:** Because images are read via `FileReader` and local paths, ensure you run this over a local HTTP server (`localhost:3000` or `127.0.0.1:5500`) rather than directly from the `file://` protocol to avoid CORS issues when reading dynamic assets.
