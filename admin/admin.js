/* ============================================================
   Loopy Knots - Admin Dashboard Engine
   Features: Product CRUD with image upload, order management,
   inventory alerts, customer CRM, real-time analytics
   ============================================================ */

const ORDERS = [
  { id: "#LK-2831", customer: "Alice Johnson", date: "Mar 22, 2026", status: "PENDING", total: 1250, items: 1 },
  { id: "#LK-2830", customer: "Michael Chen", date: "Mar 21, 2026", status: "SHIPPED", total: 8450, items: 3 },
  { id: "#LK-2829", customer: "Sarah Miller", date: "Mar 20, 2026", status: "DELIVERED", total: 450, items: 1 },
  { id: "#LK-2828", customer: "David Brown", date: "Mar 19, 2026", status: "SHIPPED", total: 2450, items: 2 },
  { id: "#LK-2827", customer: "Emma Wilson", date: "Mar 18, 2026", status: "DELIVERED", total: 12450, items: 4 },
];

const CUSTOMERS = [
  { name: "Emma Wilson", email: "emma@example.com", orders: 12, totalSpent: 72450, frequency: "Frequent" },
  { name: "Michael Chen", email: "mike@example.com", orders: 5, totalSpent: 29500, frequency: "Regular" },
  { name: "Alice Johnson", email: "alice@example.com", orders: 1, totalSpent: 1250, frequency: "New" },
];

/* --- Product Store (shared with storefront via localStorage) --- */
function getProducts() {
  const stored = localStorage.getItem('loopyProducts');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { /* fall through */ }
  }
  return [];
}

function saveProducts(products) {
  localStorage.setItem('loopyProducts', JSON.stringify(products));
}

let adminProducts = getProducts();

/* --- Upload state --- */
let uploadedImageData = null;

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  renderOrders(ORDERS);
  renderDashboardCharts();
  renderCustomers(CUSTOMERS);
  renderInventoryGrid();
  setupAdminListeners();
  setupImageUpload();
});

/* ============ PRODUCT MANAGEMENT (CRUD) ============ */

function renderInventoryGrid() {
  const container = document.getElementById('inventoryGrid');
  if (!container) return;

  if (adminProducts.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: #999;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
        <p style="font-weight: 600;">No products yet.</p>
        <p style="font-size: 0.85rem;">Click "+ Add Product" to create your first listing.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = adminProducts.map(p => {
    const imgHtml = p.image 
      ? `<img src="${p.image.startsWith('data:') ? p.image : '../' + p.image}" alt="${p.name}" style="width:100%; height:160px; object-fit:cover; border-radius:12px;">`
      : `<div style="background: #F0F0FF; height:160px; border-radius:12px; display:flex; align-items:center; justify-content:center; color: #AAA; font-size:0.85rem;">No Image</div>`;

    return `
      <div class="inv-card" id="inv-card-${p.id}">
        ${imgHtml}
        <div style="padding: 0.75rem 0;">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 2px;">${p.name}</div>
          <div style="font-size: 0.8rem; color: #888; margin-bottom: 4px;">${p.category}</div>
          <div style="font-weight: 800; color: var(--accent);">₹${p.price.toLocaleString('en-IN')}</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="inv-btn inv-btn-edit" onclick="editProduct(${p.id})" title="Edit">
            <i data-lucide="edit-3" size="14"></i> Edit
          </button>
          <button class="inv-btn inv-btn-delete" onclick="deleteProduct(${p.id})" title="Delete">
            <i data-lucide="trash-2" size="14"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Re-initialize Lucide icons for new elements
  if (window.lucide) lucide.createIcons();

  // Update stat
  const countEl = document.getElementById('totalProductCount');
  if (countEl) countEl.textContent = adminProducts.length;
}

/* --- Image Upload Handler --- */
function setupImageUpload() {
  const dropZone = document.getElementById('imageDropZone');
  const fileInput = document.getElementById('prodImageInput');
  if (!dropZone || !fileInput) return;

  // Click to upload
  dropZone.addEventListener('click', () => fileInput.click());

  // File selected
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  // Drag & Drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
}

function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (PNG, JPG, WEBP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageData = e.target.result;
    showImagePreview(uploadedImageData, file.name);
  };
  reader.readAsDataURL(file);
}

function showImagePreview(dataUrl, fileName) {
  const preview = document.getElementById('imagePreview');
  const dropZone = document.getElementById('imageDropZone');
  if (!preview) return;

  preview.innerHTML = `
    <div style="position: relative; display: inline-block;">
      <img src="${dataUrl}" alt="Preview" style="width: 120px; height: 120px; object-fit:cover; border-radius:12px; border: 2px solid var(--accent);">
      <button onclick="clearImageUpload()" style="position:absolute; top:-8px; right:-8px; width:24px; height:24px; border-radius:50%; background:var(--danger); color:white; border:none; font-weight:700; cursor:pointer; font-size:12px;">×</button>
    </div>
    <div style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">${fileName}</div>
  `;
  preview.style.display = 'block';
  if (dropZone) dropZone.style.display = 'none';
}

window.clearImageUpload = function() {
  uploadedImageData = null;
  const preview = document.getElementById('imagePreview');
  const dropZone = document.getElementById('imageDropZone');
  const fileInput = document.getElementById('prodImageInput');
  if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }
  if (dropZone) dropZone.style.display = 'block';
  if (fileInput) fileInput.value = '';
};

/* --- Add / Edit Product --- */
let editingProductId = null;

window.openAddProductModal = function() {
  editingProductId = null;
  uploadedImageData = null;
  document.getElementById('addProdForm').reset();
  document.getElementById('modalFormTitle').textContent = 'Add New Product';
  document.getElementById('prodSubmitBtn').textContent = 'Save & Publish Product';
  
  const preview = document.getElementById('imagePreview');
  const dropZone = document.getElementById('imageDropZone');
  if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }
  if (dropZone) dropZone.style.display = 'block';
  
  document.getElementById('addProdModal').style.display = 'flex';
};

window.closeAddProductModal = function() {
  document.getElementById('addProdModal').style.display = 'none';
  editingProductId = null;
  uploadedImageData = null;
};

window.editProduct = function(id) {
  const product = adminProducts.find(p => p.id === id);
  if (!product) return;

  editingProductId = id;
  document.getElementById('modalFormTitle').textContent = 'Edit Product';
  document.getElementById('prodSubmitBtn').textContent = 'Update Product';
  
  document.getElementById('prodName').value = product.name;
  document.getElementById('prodCat').value = product.category;
  document.getElementById('prodPrice').value = product.price;
  document.getElementById('prodStock').value = product.stock || 10;
  document.getElementById('prodVariants').value = (product.variants || []).join(', ');
  document.getElementById('prodDesc').value = product.description || '';
  
  // Show existing image
  if (product.image) {
    uploadedImageData = product.image;
    const imgSrc = product.image.startsWith('data:') ? product.image : '../' + product.image;
    showImagePreview(imgSrc, 'Current Image');
  }
  
  document.getElementById('addProdModal').style.display = 'flex';
};

window.handleProductSubmit = function(e) {
  e.preventDefault();
  
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCat').value;
  const price = parseInt(document.getElementById('prodPrice').value);
  const stock = parseInt(document.getElementById('prodStock').value) || 10;
  const variantsRaw = document.getElementById('prodVariants').value.trim();
  const variants = variantsRaw ? variantsRaw.split(',').map(v => v.trim()).filter(v => v) : ['Standard'];
  const description = document.getElementById('prodDesc').value.trim();
  
  if (editingProductId) {
    // UPDATE existing product
    const idx = adminProducts.findIndex(p => p.id === editingProductId);
    if (idx !== -1) {
      adminProducts[idx].name = name;
      adminProducts[idx].category = category;
      adminProducts[idx].price = price;
      adminProducts[idx].stock = stock;
      adminProducts[idx].variants = variants;
      adminProducts[idx].description = description;
      if (uploadedImageData) adminProducts[idx].image = uploadedImageData;
    }
    showToast(`"${name}" updated successfully! ✏️`);
  } else {
    // CREATE new product
    const newId = adminProducts.length > 0 ? Math.max(...adminProducts.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      name,
      category,
      price,
      stock,
      rating: 5.0,
      reviews: 0,
      variants,
      description,
      image: uploadedImageData || '',
      asset: 'flower' // SVG fallback
    };
    adminProducts.push(newProduct);
    showToast(`"${name}" published to your store! 🎉`);
  }

  saveProducts(adminProducts);
  renderInventoryGrid();
  closeAddProductModal();
  e.target.reset();
};

window.deleteProduct = function(id) {
  const product = adminProducts.find(p => p.id === id);
  if (!product) return;

  if (confirm(`Are you sure you want to delete "${product.name}"? This cannot be undone.`)) {
    adminProducts = adminProducts.filter(p => p.id !== id);
    saveProducts(adminProducts);
    renderInventoryGrid();
    showToast(`"${product.name}" removed from store.`, 'warning');
  }
};

/* --- Toast Notifications --- */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `admin-toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ============ ORDERS ============ */
function renderOrders(items) {
  const tableBody = document.getElementById('orderTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = items.map(order => `
    <tr>
      <td style="font-weight: 700;">${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.date}</td>
      <td>
        <span class="status-tag status-${order.status.toLowerCase()}">${order.status}</span>
      </td>
      <td style="font-weight: 700;">₹${order.total.toLocaleString('en-IN')}</td>
      <td style="color: var(--accent); font-weight: 600; cursor: pointer;">Update Status</td>
    </tr>
  `).join('');
}

/* ============ DASHBOARD ============ */
function renderDashboardCharts() {
  const chart = document.getElementById('salesChart');
  if (!chart) return;

  const data = [30, 45, 62, 85, 75, 98, 110];
  chart.innerHTML = data.map((val, i) => `
    <div class="chart-bar" style="height: ${Math.min(val, 100)}%; background: ${val > 90 ? 'var(--cobalt)' : '#E0E7FF'};" title="Day ${i+1}: ₹${val * 1000}">
      <div style="position: absolute; bottom: -30px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: #888;">${['M','T','W','T','F','S','S'][i]}</div>
    </div>
  `).join('');

  renderInventoryAlerts();
}

function renderInventoryAlerts() {
  const container = document.getElementById('inventoryAlerts');
  if (!container) return;

  const alerts = adminProducts.filter(p => (p.stock || 0) <= 5);
  if (alerts.length === 0) {
    container.innerHTML = '<div style="padding: 1rem; text-align:center; color:#999; font-size:0.85rem;">All products are well-stocked! ✅</div>';
    return;
  }

  container.innerHTML = alerts.map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #F5F5F5;">
      <div>
        <div style="font-weight: 700; font-size: 0.9rem;">${p.name}</div>
        <div style="font-size: 0.75rem; color: #999;">${p.stock || 0} units left</div>
      </div>
      <span class="status-tag status-${(p.stock || 0) === 0 ? 'pending' : 'shipped'}" style="font-size: 0.7rem;">
        ${(p.stock || 0) === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
      </span>
    </div>
  `).join('');
}

/* ============ CUSTOMERS ============ */
function renderCustomers(items) {
  const container = document.getElementById('customerList');
  if (!container) return;

  container.innerHTML = items.map(c => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.2rem; background: #FAFAFA; border-radius: 12px; margin-bottom: 0.8rem;">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 800;">${c.name[0]}</div>
        <div>
          <div style="font-weight: 700;">${c.name}</div>
          <div style="font-size: 0.8rem; color: #888;">${c.email}</div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 700; color: var(--accent);">₹${c.totalSpent.toLocaleString('en-IN')}</div>
        <div style="font-size: 0.8rem; color: #888;">${c.orders} Orders</div>
      </div>
    </div>
  `).join('');
}

/* ============ NAVIGATION ============ */
function setupAdminListeners() {
  const orderSearch = document.getElementById('orderSearch');
  if (orderSearch) {
    orderSearch.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = ORDERS.filter(o => o.id.toLowerCase().includes(term) || o.customer.toLowerCase().includes(term));
      renderOrders(filtered);
    });
  }

  // Section Switching
  const navItems = document.querySelectorAll('.menu-item');
  const sections = document.querySelectorAll('.admin-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-section');
      if (!target) return;
      
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => s.style.display = 'none');
      const section = document.getElementById(`${target}Section`);
      if (section) section.style.display = 'block';
    });
  });
}
