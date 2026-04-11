/**
 * Loopy Knots - Infinite Photo Slider
 * Ported from React for high-performance Vanilla JS scroll.
 */

class HeroSlider {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Try to access global PRODUCTS if available
        let products = window.PRODUCTS || [];
        
        // If undefined or empty (e.g. strict isolation), fallback
        if (!products.length) {
           try {
               products = JSON.parse(localStorage.getItem('loopyProducts')) || [];
           } catch(e) {}
        }
        
        // Sort by ID descending to get "new arrivals" and take top 5
        const newArrivals = [...products].sort((a,b) => b.id - a.id).slice(0, 5);

        this.items = newArrivals.length > 0 ? newArrivals : [{image: 'assets/slide_1.jpg'}];

        this.init();
    }

    init() {
        // Double them for seamless loop
        const allItems = [...this.items, ...this.items];
        
        allItems.forEach((product, idx) => {
            const item = document.createElement('div');
            item.className = 'image-item';
            
            const img = document.createElement('img');
            
            // Prefer first image in images array, fallback to main image, or static asset
            const src = (product.images && product.images[0]) || product.image || 'assets/slide_1.jpg';
            
            img.src = src;
            img.alt = product.name || `Loopy Crochet Gallery ${idx + 1}`;
            img.loading = 'lazy';
            
            if (product.id) {
                img.style.cursor = 'pointer';
                img.onclick = () => {
                    if (typeof window.openProductModal === 'function') {
                        window.openProductModal(product.id);
                    }
                };
            }
            
            item.appendChild(img);
            this.container.appendChild(item);
        });
    }
}

window.HeroSlider = HeroSlider;
