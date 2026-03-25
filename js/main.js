/* ============================================================
   Loopy Knots - Storefront Engine
   Features: Image-based products, localStorage sync, admin upload,
   GST checkout, discount engine, variant selector
   ============================================================ */

/* --- SVG Fallback Assets (for products without images) --- */
const ASSETS = {
  flower: `<svg viewBox="0 0 100 100" fill="none" stroke="var(--cobalt)" stroke-width="4" stroke-linecap="round"><circle cx="50" cy="50" r="10"/><path d="M50 20c8 0 15 7 15 15s-7 15-15 15-15-7-15-15 7-15 15-15zM80 50c0 8-7 15-15 15s-15-7-15-15 7-15 15-15 15 7 15 15zM50 80c-8 0-15-7-15-15s7-15 15-15 15 7 15 15-7 15-15 15zM20 50c0-8 7-15 15-15s15 7 15 15-7 15-15 15-15-7-15-15z"/></svg>`,
  bouquet: `<svg viewBox="0 0 100 100" fill="none" stroke="var(--cobalt)" stroke-width="4" stroke-linecap="round"><path d="M40 80l10-40 10 40M30 70l20-40 20 40"/><circle cx="50" cy="20" r="12"/><circle cx="30" cy="35" r="12"/><circle cx="70" cy="35" r="12"/></svg>`,
  charm: `<svg viewBox="0 0 100 100" fill="none" stroke="var(--cobalt)" stroke-width="4" stroke-linecap="round"><circle cx="50" cy="40" r="30"/><path d="M50 10v20M35 25l10 10M65 25l-10 10"/><circle cx="40" cy="35" r="3" fill="var(--cobalt)"/><circle cx="60" cy="35" r="3" fill="var(--cobalt)"/></svg>`,
  top: `<svg viewBox="0 0 100 100" fill="none" stroke="var(--cobalt)" stroke-width="4" stroke-linecap="round"><path d="M20 30h60l-10 60H30zM20 30l10-15h40l10 15"/></svg>`
};

/* --- Default Product Catalog --- */
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Flower Bouquet", category: "Flowers", price: 1500, rating: 4.9, image: "assets/products/flower_bouquet.jpg", variants: ['Standard'], reviews: 28, description: "Beautiful handcrafted crochet flower bouquet with lilies and daisies." },
  { id: 2, name: "Cobalt Rose Bouquet", category: "Bouquets", price: 1250, rating: 4.8, asset: 'bouquet', variants: ['Cobalt', 'Sky', 'Navy'], reviews: 124, description: "Elegant rose bouquet in signature cobalt tones." },
  { id: 3, name: "Loopy Cotton Top", category: "Tops", price: 2450, rating: 4.9, asset: 'top', variants: ['S', 'M', 'L'], reviews: 86, description: "Lightweight crochet cotton top perfect for summer." },
  { id: 4, name: "Happy Mascot Charm", category: "Bag Charms", price: 450, rating: 4.7, asset: 'charm', variants: ['Standard'], reviews: 52, description: "Adorable mascot charm for bags and keychains." },
  { id: 5, name: "Royal Blue Hair Bow", category: "Hair Bows", price: 350, rating: 4.5, asset: 'flower', variants: ['Small', 'Large'], reviews: 31, description: "Delicate crochet hair bow in royal blue." },
  { id: 6, name: "Yarn Loop Phone Charm", category: "Phone Charms", price: 550, rating: 4.6, asset: 'charm', variants: ['Standard'], reviews: 44, description: "Fun yarn loop phone charm to accessorize your device." },
  { id: 7, name: "Single Stitch Flower", category: "Flowers", price: 250, rating: 4.9, asset: 'flower', variants: ['Blue', 'Purple', 'Pink'], reviews: 204, description: "Simple, elegant single-stitch crochet flower." },
  { id: 8, name: "Infinite Loop Tote", category: "Bags", price: 1850, rating: 4.8, asset: 'top', variants: ['Cream', 'Cobalt'], reviews: 67, description: "Spacious and durable crochet tote bag." },
];

/* --- Product Store (localStorage-backed) --- */
function getProducts() {
  const stored = localStorage.getItem('loopyProducts');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { /* fall through */ }
  }
  // First load: save defaults
  localStorage.setItem('loopyProducts', JSON.stringify(DEFAULT_PRODUCTS));
  return [...DEFAULT_PRODUCTS];
}

function saveProducts(products) {
  localStorage.setItem('loopyProducts', JSON.stringify(products));
}

let PRODUCTS = getProducts();

let cart = JSON.parse(localStorage.getItem('loopyCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  renderProducts(PRODUCTS);
  updateCartUI();
  setupEventListeners();
});

function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
      renderProducts(filtered);
    });
  }

  // Cart Drawer
  const cartBtn = document.getElementById('cartBtn');
  const closeCart = document.getElementById('closeCart');
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('drawerOverlay');

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      drawer.classList.add('active');
      overlay.classList.add('active');
    });
  }

  if (closeCart) {
    closeCart.addEventListener('click', closeDrawer);
  }
  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }

  // Filters
  const filters = document.querySelectorAll('.filter-item input');
  filters.forEach(filter => {
    filter.addEventListener('change', () => {
      const selectedCategories = Array.from(filters)
        .filter(f => f.checked)
        .map(f => f.value);
      
      if (selectedCategories.length === 0) {
        renderProducts(PRODUCTS);
      } else {
        const filtered = PRODUCTS.filter(p => selectedCategories.includes(p.category));
        renderProducts(filtered);
      }
    });
  });
}

/* --- Product Card Rendering (supports images + SVG fallback) --- */
function renderProducts(items) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = items.map(product => {
    const hasImage = product.image && product.image.length > 0;
    
    const imageHtml = hasImage 
      ? `<img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; border-radius: 16px;">`
      : `<div style="width: 150px; height: 150px; transition: transform 0.5s ease;">${ASSETS[product.asset] || ASSETS.flower}</div>`;
    
    const wrapperStyle = hasImage 
      ? 'padding: 0; overflow: hidden;'
      : 'padding: 3rem; display: flex; align-items: center; justify-content: center;';

    return `
    <div class="product-card" onclick="openProductModal(${product.id})">
      <div class="product-img-wrapper" style="${wrapperStyle}">
        ${imageHtml}
        <div class="quick-add">
          <button class="btn btn-primary" onclick="event.stopPropagation(); triggerAddAnimation(this, ${product.id})">Quick Add</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-cat">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-bottom">
          <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
          <div class="product-rating">
            <span class="star">★</span> ${product.rating}
          </div>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

window.triggerAddAnimation = function(btn, id) {
  const rect = btn.getBoundingClientRect();
  const loop = document.createElement('div');
  loop.className = 'yarn-loop';
  loop.style.width = '80px';
  loop.style.height = '80px';
  loop.style.opacity = '1';
  loop.style.top = `${rect.top}px`;
  loop.style.left = `${rect.left}px`;
  loop.style.position = 'fixed';
  loop.style.zIndex = '9999';
  loop.style.transition = 'all 0.8s ease-in-out';
  
  document.body.appendChild(loop);
  
  setTimeout(() => {
    const cartRect = document.getElementById('cartBtn').getBoundingClientRect();
    loop.style.top = `${cartRect.top}px`;
    loop.style.left = `${cartRect.left}px`;
    loop.style.transform = 'scale(0.2)';
    loop.style.opacity = '0';
  }, 50);
  
  setTimeout(() => {
    loop.remove();
    addToCart(id);
  }, 800);
};

window.startCheckout = function() {
  alert('Starting checkout process...');
};

let currentSelectedId = null;

window.openProductModal = function(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const modal = document.getElementById('productModal');
  currentSelectedId = id;
  
  const modalImg = document.getElementById('modalImage');
  if (modalImg) {
    if (product.image) {
      modalImg.src = product.image;
      modalImg.style.display = 'block';
    } else {
      modalImg.style.display = 'none';
    }
  }
  
  document.getElementById('modalTitle').textContent = product.name;
  document.getElementById('modalPrice').textContent = `₹${product.price.toLocaleString('en-IN')}`;
  document.getElementById('modalCat').textContent = product.category;
  
  // Description
  const descEl = document.getElementById('modalDesc');
  if (descEl) descEl.textContent = product.description || '';

  // Variants UI
  const variantContainer = document.getElementById('variantOptions');
  if (variantContainer && product.variants) {
    variantContainer.innerHTML = product.variants.map((v, i) => `
      <button class="variant-btn ${i === 0 ? 'active' : ''}" onclick="selectVariant(this, '${v}')">${v}</button>
    `).join('');
    window.currentVariant = product.variants[0];
  }

  // Reviews UI
  const reviewCount = document.getElementById('modalReviews');
  if (reviewCount) {
    reviewCount.innerHTML = `<span class="star">★</span> ${product.rating} (${product.reviews} reviews)`;
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.selectVariant = function(btn, variant) {
  document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window.currentVariant = variant;
};

window.closeProductModal = function() {
  document.getElementById('productModal').classList.remove('active');
  document.body.style.overflow = 'auto';
};

window.toggleCareItem = function(id) {
  const item = document.getElementById(`care-${id}`);
  item.classList.toggle('active');
};

window.openCheckout = function() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  document.getElementById('cartDrawer').classList.remove('active');
  document.getElementById('drawerOverlay').classList.remove('active');
  document.getElementById('checkoutModal').classList.add('active');
};

window.nextStep = function(step) {
  document.getElementById('shippingForm').style.display = 'none';
  document.getElementById('paymentForm').style.display = 'none';
  document.getElementById('reviewForm').style.display = 'none';
  
  document.getElementById('step1').classList.remove('active');
  document.getElementById('step2').classList.remove('active');
  document.getElementById('step3').classList.remove('active');

  if(step === 1) {
    document.getElementById('shippingForm').style.display = 'block';
    document.getElementById('step1').classList.add('active');
  } else if(step === 2) {
    document.getElementById('paymentForm').style.display = 'block';
    document.getElementById('step2').classList.add('active');
  } else if(step === 3) {
    document.getElementById('reviewForm').style.display = 'block';
    document.getElementById('step3').classList.add('active');
  }
};

function addToCart(id, variant = null) {
  const product = PRODUCTS.find(p => p.id === id);
  const selectedVariant = variant || window.currentVariant || (product.variants ? product.variants[0] : null);
  
  const existing = cart.find(item => item.id === id && item.variant === selectedVariant);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({...product, quantity: 1, variant: selectedVariant});
  }
  
  saveCart();
  updateCartUI();
  
  // Shake cart icon
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.classList.add('shake');
    setTimeout(() => cartBtn.classList.remove('shake'), 500);
  }
}

let discountPercent = 0;
window.applyDiscount = function() {
  const code = document.getElementById('discountCode').value.toUpperCase();
  const msg = document.getElementById('discountMsg');
  
  if (code === 'LOOPY10') {
    discountPercent = 10;
    msg.textContent = 'Discount applied: 10% off!';
    msg.style.color = 'var(--cobalt)';
  } else if (code === 'WELCOME20') {
    discountPercent = 20;
    msg.textContent = 'Discount applied: 20% off!';
    msg.style.color = 'var(--cobalt)';
  } else {
    discountPercent = 0;
    msg.textContent = 'Invalid code.';
    msg.style.color = 'var(--danger)';
  }
  updateCartUI();
};

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const itemsContainer = document.getElementById('cartItems');
  const subtotalLabel = document.getElementById('subtotal');
  
  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  badge.textContent = totalItems;
  
  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: #999;">Your cart is empty.</div>';
    } else {
      itemsContainer.innerHTML = cart.map(item => {
        const thumbHtml = item.image 
          ? `<img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">`
          : `<div class="cart-item-img" style="width: 50px; height: 50px; padding: 5px;">${ASSETS[item.asset] || ASSETS.flower}</div>`;
        
        return `
        <div class="cart-item">
          ${thumbHtml}
          <div class="cart-item-info">
            <h5>${item.name} ${item.variant ? `<span style="font-size:0.75rem; color:#888;">(${item.variant})</span>` : ''}</h5>
            <p>₹${item.price.toLocaleString('en-IN')} x ${item.quantity}</p>
          </div>
          <button onclick="removeFromCart(${item.id}, '${item.variant}')" style="background:none; color: var(--cobalt); font-weight: 700;">×</button>
        </div>
      `;
      }).join('');
    }
  }
  
  const subtotalBeforeDiscount = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const discountAmount = Math.round(subtotalBeforeDiscount * (discountPercent / 100));
  const subtotal = subtotalBeforeDiscount - discountAmount;
  
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  if (subtotalLabel) subtotalLabel.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  const gstLabel = document.getElementById('gstTotal');
  if (gstLabel) gstLabel.textContent = `₹${gst.toLocaleString('en-IN')}`;
  const totalPriceLabel = document.getElementById('totalPrice');
  if (totalPriceLabel) totalPriceLabel.textContent = `₹${total.toLocaleString('en-IN')}`;

  // Shipping Progress Bar
  const freeShippingThreshold = 4999;
  const progress = Math.min((subtotalBeforeDiscount / freeShippingThreshold) * 100, 100);
  const progressBar = document.getElementById('shippingProgress');
  const shippingMsg = document.getElementById('shippingMsg');
  
  if (progressBar) progressBar.style.width = `${progress}%`;
  if (shippingMsg) {
    if (subtotalBeforeDiscount >= freeShippingThreshold) {
      shippingMsg.textContent = "Congrats! You've unlocked FREE Shipping!";
    } else {
      const remaining = freeShippingThreshold - subtotalBeforeDiscount;
      shippingMsg.textContent = `Add ₹${remaining.toLocaleString('en-IN')} more for FREE shipping!`;
    }
  }
}

window.removeFromCart = function(id, variant = null) {
  cart = cart.filter(item => !(item.id === id && item.variant === variant));
  saveCart();
  updateCartUI();
};

// Initialize UI & Components
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    renderProducts(PRODUCTS);
    
    // Initialize Waves Background
    if (window.Waves) {
        new Waves('waves-container', {
            strokeColor: '#1A53FF',
            backgroundColor: 'transparent'
        });
    }

    // Initialize Hero Image Slider
    if (window.HeroSlider) {
        new HeroSlider('hero-slider');
    }

    // Interactive Logo Spin
    const logoImg = document.querySelector('.logo-img');
    if (logoImg) {
        logoImg.addEventListener('click', () => {
            logoImg.classList.remove('logo-spin');
            void logoImg.offsetWidth; // Trigger reflow
            logoImg.classList.add('logo-spin');
        });
    }
});

function saveCart() {
  localStorage.setItem('loopyCart', JSON.stringify(cart));
}

window.updateTaxType = function() {
  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const state = document.getElementById('stateSelect').value;
  const gstTotal = Math.round(subtotal * 0.18);
  const halfGst = Math.round(gstTotal / 2);
  
  const intraRow = document.getElementById('intraTaxRow');
  const interRow = document.getElementById('interTaxRow');
  
  if (state === 'within') {
    if (intraRow) intraRow.style.display = 'block';
    if (interRow) interRow.style.display = 'none';
    const cgst = document.getElementById('cgstLabel');
    const sgst = document.getElementById('sgstLabel');
    if (cgst) cgst.textContent = `₹${halfGst}`;
    if (sgst) sgst.textContent = `₹${halfGst}`;
  } else {
    if (intraRow) intraRow.style.display = 'none';
    if (interRow) interRow.style.display = 'block';
    const igst = document.getElementById('igstLabel');
    if (igst) igst.textContent = `₹${gstTotal}`;
  }
  
  const rs = document.getElementById('reviewSubtotal');
  const rt = document.getElementById('reviewTotal');
  if (rs) rs.textContent = `₹${subtotal}`;
  if (rt) rt.textContent = `₹${subtotal + gstTotal}`;
};

// Update nextStep to trigger tax calculation on review step
const originalNextStep = window.nextStep;
window.nextStep = function(step) {
  originalNextStep(step);
  if (step === 3) {
    window.updateTaxType();
  }
};
