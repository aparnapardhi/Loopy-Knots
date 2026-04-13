/**
 * Loopy Knots - Vanilla Wavy Background
 * Ported from React component to high-performance Vanilla JS
 */

class Waves {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.strokeColor = options.strokeColor || "#1A53FF";
        this.backgroundColor = options.backgroundColor || "transparent";
        
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.style.display = 'block';
        this.svg.style.width = '100%';
        this.svg.style.height = '100%';
        this.container.appendChild(this.svg);

        this.mouse = {
            x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false
        };

        this.paths = [];
        this.lines = [];
        
        // SimplexNoise check and initialization
        if (typeof SimplexNoise !== 'undefined') {
          this.noise = new SimplexNoise();
        } else {
          console.error("SimplexNoise is not defined. Ensure the library is loaded via CDN.");
          return; // Exit constructor if noise is missing
        }
        
        this.raf = null;
        this.bounding = null;

        this.init();
    }

    init() {
        this.setSize();
        this.setLines();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });

        this.tick = this.tick.bind(this);
        this.raf = requestAnimationFrame(this.tick);
    }

    setSize() {
        this.bounding = this.container.getBoundingClientRect();
        this.svg.setAttribute('width', this.bounding.width);
        this.svg.setAttribute('height', this.bounding.height);
    }

    setLines() {
        const { width, height } = this.bounding;
        this.lines = [];
        this.paths.forEach(p => p.remove());
        this.paths = [];

        const xGap = 8;  // Reduced horizontal spacing for denser, smoother results
        const yGap = 8;  // Reduced vertical spacing
        const oWidth = width + 200;
        const oHeight = height + 30;

        const totalLines = Math.ceil(oWidth / xGap);
        const totalPoints = Math.ceil(oHeight / yGap);

        const xStart = (width - xGap * totalLines) / 2;
        const yStart = (height - yGap * totalPoints) / 2;

        for (let i = 0; i < totalLines; i++) {
            const points = [];
            for (let j = 0; j < totalPoints; j++) {
                points.push({
                    x: xStart + xGap * i,
                    y: yStart + yGap * j,
                    wave: { x: 0, y: 0 },
                    cursor: { x: 0, y: 0, vx: 0, vy: 0 },
                });
            }

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', this.strokeColor);
            path.setAttribute('stroke-width', '1');
            path.setAttribute('stroke-opacity', '0.1');
            this.svg.appendChild(path);
            this.paths.push(path);
            this.lines.push(points);
        }
    }

    onResize() {
        this.setSize();
        this.setLines();
    }

    onMouseMove(e) {
        this.updateMousePosition(e.pageX, e.pageY);
    }

    onTouchMove(e) {
        e.preventDefault();
        this.updateMousePosition(e.touches[0].pageX, e.touches[0].pageY);
    }

    updateMousePosition(x, y) {
        if (!this.bounding) return;
        
        this.mouse.x = x - this.bounding.left;
        this.mouse.y = y - this.bounding.top;

        if (!this.mouse.set) {
            this.mouse.sx = this.mouse.lx = this.mouse.x;
            this.mouse.sy = this.mouse.ly = this.mouse.y;
            this.mouse.set = true;
        }
    }

    movePoints(time) {
        const { lines, mouse, noise } = this;
        
        lines.forEach(points => {
            points.forEach(p => {
                const move = noise.noise2D(
                    (p.x + time * 0.008) * 0.003,
                    (p.y + time * 0.003) * 0.002
                ) * 8;

                p.wave.x = Math.cos(move) * 12;
                p.wave.y = Math.sin(move) * 6;

                const dx = p.x - mouse.sx;
                const dy = p.y - mouse.sy;
                const d = Math.hypot(dx, dy);
                const l = Math.max(175, mouse.vs);

                if (d < l) {
                    const s = 1 - d / l;
                    const f = Math.cos(d * 0.001) * s;
                    p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00035;
                    p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00035;
                }

                p.cursor.vx += (0 - p.cursor.x) * 0.01;
                p.cursor.vy += (0 - p.cursor.y) * 0.01;
                p.cursor.vx *= 0.95;
                p.cursor.vy *= 0.95;
                p.cursor.x += p.cursor.vx;
                p.cursor.y += p.cursor.vy;

                // Limit deformation range
                p.cursor.x = Math.min(50, Math.max(-50, p.cursor.x));
                p.cursor.y = Math.min(50, Math.max(-50, p.cursor.y));
            });
        });
    }

    drawLines() {
        this.lines.forEach((points, i) => {
            if (!this.paths[i] || points.length < 2) return;
            
            let d = `M ${points[0].x + points[0].wave.x} ${points[0].y + points[0].wave.y}`;
            for (let j = 1; j < points.length; j++) {
                const p = points[j];
                d += ` L ${p.x + p.wave.x + p.cursor.x} ${p.y + p.wave.y + p.cursor.y}`;
            }
            this.paths[i].setAttribute('d', d);
        });
    }

    tick(time) {
        const { mouse } = this;
        mouse.sx += (mouse.x - mouse.sx) * 0.1;
        mouse.sy += (mouse.y - mouse.sy) * 0.1

        const dx = mouse.x - mouse.lx;
        const dy = mouse.y - mouse.ly;
        const d = Math.hypot(dx, dy);

        mouse.v = d;
        mouse.vs += (d - mouse.vs) * 0.1;
        mouse.vs = Math.min(100, mouse.vs);
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;
        mouse.a = Math.atan2(dy, dx);

        // Update CSS variables for the pointer dot
        this.container.style.setProperty('--x', `${mouse.sx}px`);
        this.container.style.setProperty('--y', `${mouse.sy}px`);

        this.movePoints(time);
        this.drawLines();
        this.raf = requestAnimationFrame(this.tick);
    }
}

// Global initialization
window.Waves = Waves;
