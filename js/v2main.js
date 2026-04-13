/* ============================================================
   Loopy Knots V2 — Main JavaScript
   Features: Catalog mode, Instagram DM inquiry, Make It For Me,
   Shareable product URLs, Wishlist, Stock enforcement
   ============================================================ */

const IG_HANDLE = 'loopy__knots'; // ← Your Instagram username

/* --- SVG Fallback Assets --- */
const ASSETS = {
  flower: `<svg viewBox="0 0 100 100" fill="none" stroke="var(--cobalt)" stroke-width="4" stroke-linecap="round"><circle cx="50" cy="50" r="10"/><path d="M50 20c8 0 15 7 15 15s-7 15-15 15-15-7-15-15 7-15 15-15zM80 50c0 8-7 15-15 15s-15-7-15-15 7-15 15-15 15 7 15 15zM50 80c-8 0-15-7-15-15s7-15 15-15 15 7 15 15-7 15-15 15zM20 50c0-8 7-15 15-15s15 7 15 15-7 15-15 15-15-7-15-15z"/></svg>`,
  bouquet: `<svg viewBox="0 0 100 100" fill="none" stroke="var(--cobalt)" stroke-width="4" stroke-linecap="round"><path d="M40 80l10-40 10 40M30 70l20-40 20 40"/><circle cx="50" cy="20" r="12"/><circle cx="30" cy="35" r="12"/><circle cx="70" cy="35" r="12"/></svg>`,
  charm: `<svg viewBox="0 0 100 100" fill="none" stroke="var(--cobalt)" stroke-width="4" stroke-linecap="round"><circle cx="50" cy="40" r="30"/><path d="M50 10v20M35 25l10 10M65 25l-10 10"/><circle cx="40" cy="35" r="3" fill="var(--cobalt)"/><circle cx="60" cy="35" r="3" fill="var(--cobalt)"/></svg>`,
  top: `<svg viewBox="0 0 100 100" fill="none" stroke="var(--cobalt)" stroke-width="4" stroke-linecap="round"><path d="M20 30h60l-10 60H30zM20 30l10-15h40l10 15"/></svg>`
};

/* --- Default Product Catalog --- */
const DEFAULT_PRODUCTS = [
  {
    id: 1, name: "Flower Bouquet", category: "Flowers", price: 1500, rating: 4.9,
    image: "assets/products/flower_bouquet.jpg", variants: ['Standard'], reviews: 28,
    description: "Beautiful handcrafted crochet flower bouquet with lilies and daisies. Made with 100% sustainable cotton yarn, each bloom is individually crafted.",
    stock: 10,
    testimonials: [
      { name: "Priya M.", text: "Absolutely gorgeous! Gave it as a birthday gift and she loved it." },
      { name: "Ananya R.", text: "The quality is amazing. You can tell how much care went into each petal." }
    ]
  },
  {
    id: 2, name: "Cobalt Rose Bouquet", category: "Bouquets", price: 1250, rating: 4.8,
    asset: 'bouquet', variants: ['Cobalt', 'Sky', 'Navy'], reviews: 124,
    description: "Elegant rose bouquet in signature cobalt tones. Perfect for home decor, gifting, or a pop of color on any desk.",
    stock: 5,
    testimonials: [
      { name: "Sneha T.", text: "Ordered the Sky Blue one — it's even more beautiful in person!" },
      { name: "Diya K.", text: "Perfect gift for my mom. She keeps it on her study table." }
    ]
  },
  {
    id: 3, name: "Loopy Cotton Top", category: "Tops", price: 2450, rating: 4.9,
    asset: 'top', variants: ['S', 'M', 'L'], reviews: 86,
    description: "Lightweight crochet cotton top perfect for summer. Breathable, stylish, and one-of-a-kind.",
    stock: 3,
    testimonials: [
      { name: "Meera P.", text: "Got so many compliments when I wore this! The fit is perfect." }
    ]
  },
  {
    id: 4, name: "Happy Mascot Charm", category: "Bag Charms", price: 450, rating: 4.7,
    asset: 'charm', variants: ['Standard'], reviews: 52,
    description: "Adorable mascot charm for bags and keychains. A perfect little companion that's full of personality.",
    stock: 20,
    testimonials: [
      { name: "Riya S.", text: "My bag has never looked cuter. Ordered two!" }
    ]
  },
  {
    id: 5, name: "Royal Blue Hair Bow", category: "Hair Bows", price: 350, rating: 4.5,
    asset: 'flower', variants: ['Small', 'Large'], reviews: 31,
    description: "Delicate crochet hair bow in royal blue. Pairs beautifully with casual and formal outfits alike.",
    stock: 15,
    testimonials: [
      { name: "Nisha G.", text: "So cute! Got the large one and it's perfect." }
    ]
  },
  {
    id: 6, name: "Yarn Loop Phone Charm", category: "Phone Charms", price: 550, rating: 4.6,
    asset: 'charm', variants: ['Standard'], reviews: 44,
    description: "Fun yarn loop phone charm to accessorize your device. Compatible with most phone cases.",
    stock: 12,
    testimonials: []
  },
  {
    id: 7, name: "Single Stitch Flower", category: "Flowers", price: 250, rating: 4.9,
    asset: 'flower', variants: ['Blue', 'Purple', 'Pink'], reviews: 204,
    description: "Simple, elegant single-stitch crochet flower. Available in multiple colours — a lovely small gift.",
    stock: 30,
    testimonials: [
      { name: "Kavya J.", text: "Ordered 5 in different colors. Adorable!" }
    ]
  },
  {
    id: 8, name: "Infinite Loop Tote", category: "Bags", price: 1850, rating: 4.8,
    asset: 'top', variants: ['Cream', 'Cobalt'], reviews: 67,
    description: "Spacious and durable crochet tote bag. Hand-woven with thick yarn for maximum strength and style.",
    stock: 0,
    testimonials: [
      { name: "Aditi R.", text: "Use it every day. So many people ask me where I got it from!" }
    ]
  },
];

/* --- Product Store --- */
function getProducts() {
  const stored = localStorage.getItem('loopyProducts');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge in any testimonials from defaults if missing
      return parsed.map(p => {
        const def = DEFAULT_PRODUCTS.find(d => d.id === p.id);
        return { testimonials: [], ...def, ...p };
      });
    } catch(e) { /* fall through */ }
  }
  localStorage.setItem('loopyProducts', JSON.stringify(DEFAULT_PRODUCTS));
  return [...DEFAULT_PRODUCTS];
}

let PRODUCTS = getProducts();
let currentSelectedProduct = null;
let currentSelectedVariant = null;
let currentFilter = 'All';
let currentMaxPrice = 10000;
let currentSortMode = 'featured';
let wishlist = JSON.parse(localStorage.getItem('lk_wishlist')) || [];
let miUploadedImageData = null;
let miUploadedFileName = null;

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(PRODUCTS);
  setupEventListeners();
  checkShareableProductURL();
  setupMakeItDragDrop();
  lucide.createIcons();

  // Re-initialize wavy background if the container exists
  if (window.Waves && document.getElementById('waves-container')) {
    new Waves('waves-container', { strokeColor: '#1A53FF', backgroundColor: 'transparent' });
  }
});

/* ─────────────────────────────────────────
   SHAREABLE PRODUCT URL
───────────────────────────────────────── */
function checkShareableProductURL() {
  const params = new URLSearchParams(window.location.search);
  const pId = params.get('product');
  if (pId) {
    const product = PRODUCTS.find(p => p.id === parseInt(pId));
    if (product) {
      setTimeout(() => openProductModal(product.id), 300);
    }
  }
}

/* ─────────────────────────────────────────
   EVENT LISTENERS
───────────────────────────────────────── */
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      if (!term) { renderProducts(getFilteredProducts()); return; }
      const filtered = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term)
      );
      renderProducts(filtered);
    });
  }
}

/* ─────────────────────────────────────────
   FILTERING & SORTING
───────────────────────────────────────── */
function getFilteredProducts() {
  let list = [...PRODUCTS];

  // Category filter
  if (currentFilter !== 'All') {
    list = list.filter(p => p.category === currentFilter);
  }

  // Price filter
  list = list.filter(p => p.price <= currentMaxPrice);

  // Sort
  if (currentSortMode === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (currentSortMode === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  }

  return list;
}

window.filterCategory = function(cat) {
  currentFilter = cat;
  // Update cat pills
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  const activePill = [...document.querySelectorAll('.cat-pill')].find(p => p.textContent.trim() === cat || (cat === 'All' && p.textContent.trim() === 'All'));
  if (activePill) activePill.classList.add('active');
  // Update section header
  const title = document.getElementById('sectionTitle');
  const sub = document.getElementById('sectionSubtitle');
  if (title) title.textContent = cat === 'All' ? 'All Categories' : cat;
  if (sub) sub.textContent = cat === 'All' ? 'Our Collection' : 'Category';
  renderProducts(getFilteredProducts());
};

window.filterByCheckbox = function() {
  const checked = [...document.querySelectorAll('.filter-list input:checked')].map(cb => cb.value);
  if (checked.length === 0) { currentFilter = 'All'; } else { currentFilter = checked[0]; }
  renderProducts(getFilteredProducts());
};

window.sortProducts = function(mode) {
  currentSortMode = mode;
  renderProducts(getFilteredProducts());
};

window.updatePriceFilter = function(val) {
  currentMaxPrice = parseInt(val);
  const label = document.getElementById('priceRangeLabel');
  if (label) label.textContent = val >= 10000 ? '₹10,000+' : `₹${parseInt(val).toLocaleString('en-IN')}`;
  renderProducts(getFilteredProducts());
};

/* ─────────────────────────────────────────
   RENDER PRODUCTS
───────────────────────────────────────── */
function renderProducts(list) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:4rem; color:#999;"><div style="font-size:3rem; margin-bottom:1rem;">🧶</div><p style="font-weight:600;">No products found.</p></div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const inWishlist = wishlist.includes(p.id);
    const isSoldOut = (p.stock || 0) <= 0;
    const isLowStock = (p.stock || 0) > 0 && (p.stock || 0) <= 5;
    let imgHtml;
    if (p.image) {
      imgHtml = `<img src="${p.image.startsWith('data:') ? p.image : p.image}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">`;
    } else if (p.asset && ASSETS[p.asset]) {
      imgHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:2rem; background: var(--cream-dark);">${ASSETS[p.asset]}</div>`;
    } else {
      imgHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#ccc;">No Image</div>`;
    }

    return `
      <div class="product-card ${isSoldOut ? 'sold-out-card' : ''}" onclick="openProductModal(${p.id})" style="position: relative;">
        <div class="product-image" style="position: relative; overflow: hidden;">
          ${imgHtml}
          ${isSoldOut ? `<div class="sold-out-badge">Sold Out</div>` : ''}
          ${isLowStock ? `<div class="sold-out-badge" style="background: rgba(217,119,6,0.8);">Only ${p.stock} left</div>` : ''}
          <button class="wishlist-btn ${inWishlist ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlistCard(${p.id}, this)" title="Save">
            <i data-lucide="heart" size="18"></i>
          </button>
        </div>
        <div class="product-info">
          <div class="product-category">${p.category}</div>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-footer">
            <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
            <div style="font-size:0.8rem; color:#999;">⭐ ${p.rating} (${p.reviews})</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

/* ─────────────────────────────────────────
   PRODUCT MODAL (LOOKBOOK)
───────────────────────────────────────── */
window.openProductModal = function(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  currentSelectedProduct = product;
  currentSelectedVariant = (product.variants && product.variants[0]) || 'Standard';

  // Update URL for shareability
  const url = new URL(window.location.href);
  url.searchParams.set('product', id);
  window.history.pushState({}, '', url);

  // Image
  const img = document.getElementById('modalImage');
  if (product.image) {
    img.src = product.image.startsWith('data:') ? product.image : product.image;
  } else if (product.asset && ASSETS[product.asset]) {
    img.style.display = 'none';
    const slider = document.getElementById('modalImageSlider');
    slider.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:3rem; background: var(--cream-dark);">${ASSETS[product.asset]}</div>`;
  }

  // Details
  document.getElementById('modalCat').textContent = product.category;
  document.getElementById('modalTitle').textContent = product.name;
  document.getElementById('modalPrice').textContent = `₹${product.price.toLocaleString('en-IN')}`;
  document.getElementById('modalReviews').textContent = `⭐ ${product.rating} · ${product.reviews} reviews`;

  const stock = product.stock || 0;
  const stockBadge = document.getElementById('modalStockBadge');
  if (stock <= 0) {
    stockBadge.textContent = '❌ Currently out of stock — DM us on Instagram to pre-order';
    stockBadge.className = 'stock-low';
  } else if (stock <= 5) {
    stockBadge.textContent = `⚡ Only ${stock} left in stock`;
    stockBadge.className = 'stock-low';
  } else {
    stockBadge.textContent = '✅ In stock · Ready to ship';
    stockBadge.className = 'stock-ok';
  }

  document.getElementById('modalDesc').textContent = product.description || 'Every stitch in this piece was hand-crafted by our local artisans. We use sustainable, 100% cotton yarn.';

  // Variants
  const variantEl = document.getElementById('variantOptions');
  if (product.variants && product.variants.length > 0) {
    variantEl.innerHTML = product.variants.map((v, i) => `
      <button class="variant-btn ${i === 0 ? 'active' : ''}" onclick="selectVariant('${v}', this)">${v}</button>
    `).join('');
  } else {
    variantEl.innerHTML = '';
  }

  // Testimonials
  const reviewSection = document.getElementById('modalReviewSection');
  const reviewList = document.getElementById('modalReviewList');
  const testimonials = product.testimonials || [];
  if (testimonials.length > 0) {
    reviewSection.style.display = 'block';
    reviewList.innerHTML = testimonials.map(t => `
      <div style="background: var(--cream-dark); border-radius: 10px; padding: 0.8rem 1rem;">
        <p style="font-size: 0.85rem; color: var(--charcoal); margin-bottom: 4px;">"${t.text}"</p>
        <span style="font-size: 0.75rem; color: #888; font-weight: 600;">— ${t.name}</span>
      </div>
    `).join('');
  } else {
    reviewSection.style.display = 'none';
  }

  // Wishlist state
  const wbtn = document.getElementById('wishlistBtn');
  if (wbtn) {
    wbtn.classList.toggle('active', wishlist.includes(id));
  }

  // Related products
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== id).slice(0, 5);
  const relatedEl = document.getElementById('relatedProducts');
  const relatedSection = document.getElementById('relatedSection');
  if (relatedSection) relatedSection.style.display = related.length > 0 ? 'block' : 'none';
  if (relatedEl && related.length > 0) {
    relatedEl.innerHTML = related.map(rp => {
      let thumb;
      if (rp.image) {
        thumb = `<img src="${rp.image}" alt="${rp.name}" style="width:100%; height:80px; object-fit:cover;" loading="lazy">`;
      } else if (rp.asset && ASSETS[rp.asset]) {
        thumb = `<div style="width:100%; height:80px; display:flex; align-items:center; justify-content:center; background:var(--cream-dark); padding:1rem;">${ASSETS[rp.asset]}</div>`;
      } else {
        thumb = `<div style="width:100%; height:80px; background:var(--cream-dark);"></div>`;
      }
      return `
        <div class="related-mini-card" onclick="openProductModal(${rp.id})">
          ${thumb}
          <div class="related-mini-card-info">
            <p>${rp.name}</p>
            <span>₹${rp.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('productModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
};

window.closeProductModal = function() {
  document.getElementById('productModal').classList.remove('active');
  document.body.style.overflow = '';
  // Clean up URL
  const url = new URL(window.location.href);
  url.searchParams.delete('product');
  window.history.pushState({}, '', url);
};

window.selectVariant = function(variant, btn) {
  currentSelectedVariant = variant;
  document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

/* ─────────────────────────────────────────
   WISHLIST
───────────────────────────────────────── */
window.toggleWishlist = function() {
  if (!currentSelectedProduct) return;
  const id = currentSelectedProduct.id;
  const btn = document.getElementById('wishlistBtn');
  const idx = wishlist.indexOf(id);
  if (idx === -1) {
    wishlist.push(id);
    btn.classList.add('active');
    showToast('Saved!', 'Added to your wishlist ♥');
  } else {
    wishlist.splice(idx, 1);
    btn.classList.remove('active');
    showToast('Removed', 'Removed from wishlist');
  }
  localStorage.setItem('lk_wishlist', JSON.stringify(wishlist));
};

window.toggleWishlistCard = function(id, btn) {
  const idx = wishlist.indexOf(id);
  if (idx === -1) {
    wishlist.push(id);
    btn.classList.add('active');
    showToast('Saved!', 'Added to your wishlist ♥');
  } else {
    wishlist.splice(idx, 1);
    btn.classList.remove('active');
  }
  localStorage.setItem('lk_wishlist', JSON.stringify(wishlist));
};

/* ─────────────────────────────────────────
   INSTAGRAM INQUIRY FLOW
───────────────────────────────────────── */
window.inquireOnInstagram = function() {
  if (!currentSelectedProduct) return;
  const p = currentSelectedProduct;
  const variant = currentSelectedVariant || (p.variants && p.variants[0]) || 'Standard';

  const message = `Hi Loopy Knots! 👋\n\nI'm interested in ordering:\n🧶 *${p.name}*\n🎨 Variant: ${variant}\n💰 Price: ₹${p.price.toLocaleString('en-IN')}\n\nCould you please share more details?`;

  // Copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message).then(() => {
      showToast('Message Copied!', 'Paste it when Instagram opens 📋');
    }).catch(() => {
      fallbackCopy(message);
    });
  } else {
    fallbackCopy(message);
  }

  // Open Instagram DM
  setTimeout(() => {
    window.open(`https://ig.me/m/${IG_HANDLE}`, '_blank');
  }, 600);
};

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('Message Copied!', 'Paste it when Instagram opens 📋');
}

/* ─────────────────────────────────────────
   MAKE IT FOR ME
───────────────────────────────────────── */
window.scrollToMakeIt = function() {
  const el = document.getElementById('makeItForMe');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.handleMakeItUpload = function(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Invalid file', 'Please upload an image file.');
      return;
    }
    miUploadedFileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      miUploadedImageData = e.target.result;
      showUploadPreview(miUploadedImageData, file.name);
    };
    reader.readAsDataURL(file);
  }
};

function showUploadPreview(dataUrl, fileName) {
  const zone = document.getElementById('miUploadZone');
  const inner = document.getElementById('miUploadInner');
  if (!inner) return;
  inner.innerHTML = `
    <div class="upload-preview-inside">
      <img src="${dataUrl}" alt="Preview">
      <div>
        <p>${fileName}</p>
        <span>Image ready ✅</span>
        <br>
        <button class="upload-clear-btn" onclick="event.stopPropagation(); clearMakeItUpload()">Remove</button>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

window.clearMakeItUpload = function() {
  miUploadedImageData = null;
  miUploadedFileName = null;
  document.getElementById('miFileInput').value = '';
  document.getElementById('miUploadInner').innerHTML = `
    <div class="upload-icon">📸</div>
    <p class="upload-title">Drop your reference image here</p>
    <p class="upload-subtitle">Pinterest, Instagram screenshot, or any photo</p>
    <span class="upload-tag">Click to browse</span>
  `;
};

window.previewMakeItRequest = function() {
  const desc = document.getElementById('miDescription').value.trim();
  if (!miUploadedImageData && !desc) {
    showToast('Missing details', 'Please upload an image or add a description first.');
    return;
  }

  // Build preview
  const previewImg = document.getElementById('previewImage');
  const previewDesc = document.getElementById('previewDesc');

  if (miUploadedImageData) {
    previewImg.src = miUploadedImageData;
    previewImg.style.display = 'block';
  } else {
    previewImg.style.display = 'none';
  }

  previewDesc.textContent = desc || '(No description added — image reference only)';

  // Auto-copy the request message
  const requestMessage = `Hi Loopy Knots! 👋\n\nI'd like to place a custom order!\n\n📝 My request:\n${desc || '(See reference image)'}\n\nPlease let me know if you can make this and what it would cost! 🧶`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(requestMessage).then(() => {
      const copiedMsg = document.getElementById('previewCopiedMsg');
      if (copiedMsg) copiedMsg.style.display = 'flex';
    });
  }

  // Show preview, hide form
  document.getElementById('makeItForm').style.display = 'none';
  document.getElementById('makeItPreview').classList.remove('hidden');

  if (window.lucide) lucide.createIcons();
};

window.sendCustomOrderToInstagram = function() {
  const desc = document.getElementById('miDescription')?.value.trim() || '';
  const requestMessage = `Hi Loopy Knots! 👋\n\nI'd like to place a custom order!\n\n📝 My request:\n${desc || '(See reference image I\'ll attach)'}\n\nPlease let me know if you can make this and what it would cost! 🧶`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(requestMessage).then(() => {
      showToast('Message Copied!', 'Paste it in your Instagram DM 📋');
    });
  }

  setTimeout(() => {
    window.open(`https://ig.me/m/${IG_HANDLE}`, '_blank');
  }, 600);
};

window.copyRequestText = function() {
  const desc = document.getElementById('miDescription')?.value.trim() || '';
  const msg = `Hi Loopy Knots! 👋\n\nCustom Order Request:\n${desc || '(See reference image)'}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(msg).then(() => {
      const el = document.getElementById('previewCopiedMsg');
      if (el) { el.style.display = 'flex'; setTimeout(() => el.style.display = 'none', 3000); }
    });
  } else {
    fallbackCopy(msg);
  }
};

window.resetMakeIt = function() {
  clearMakeItUpload();
  document.getElementById('miDescription').value = '';
  document.getElementById('makeItForm').style.display = 'flex';
  document.getElementById('makeItPreview').classList.add('hidden');
  document.getElementById('previewCopiedMsg').style.display = 'none';
  miUploadedImageData = null;
};

function setupMakeItDragDrop() {
  const zone = document.getElementById('miUploadZone');
  if (!zone) return;
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-active'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-active'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-active');
    if (e.dataTransfer.files.length > 0) {
      const fakeInput = { files: e.dataTransfer.files };
      handleMakeItUpload(fakeInput);
    }
  });
}

/* ─────────────────────────────────────────
   ANNOUNCEMENT BAR
───────────────────────────────────────── */
window.closeAnnouncement = function() {
  const bar = document.getElementById('announcementBar');
  if (bar) bar.style.display = 'none';
};

/* ─────────────────────────────────────────
   MOBILE NAV
───────────────────────────────────────── */
window.toggleMobileMenu = function() {
  document.getElementById('mobileMenuDrawer')?.classList.toggle('active');
  document.getElementById('mobileMenuOverlay')?.classList.toggle('active');
};
window.closeMobileMenu = function() {
  document.getElementById('mobileMenuDrawer')?.classList.remove('active');
  document.getElementById('mobileMenuOverlay')?.classList.remove('active');
};

/* ─────────────────────────────────────────
   TOAST NOTIFICATIONS
───────────────────────────────────────── */
function showToast(title, message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="check-circle" size="18"></i></div>
    <div class="toast-content">
      <h4>${title}</h4>
      ${message ? `<p>${message}</p>` : ''}
    </div>
  `;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-50px)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
