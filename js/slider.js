/**
 * Loopy Knots - Infinite Photo Slider
 * Ported from React for high-performance Vanilla JS scroll.
 */

class HeroSlider {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.images = [
            'assets/slide_1.jpg',
            'assets/slide_2.jpg',
            'assets/slide_3.png',
            'assets/slide_4.jpg',
            'assets/slide_5.jpg'
        ];

        this.init();
    }

    init() {
        // Double them for seamless loop
        const allImages = [...this.images, ...this.images];
        
        allImages.forEach((src, idx) => {
            const item = document.createElement('div');
            item.className = 'image-item';
            
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Loopy Crochet Gallery ${idx + 1}`;
            img.loading = 'lazy';
            
            item.appendChild(img);
            this.container.appendChild(item);
        });
    }
}

window.HeroSlider = HeroSlider;
