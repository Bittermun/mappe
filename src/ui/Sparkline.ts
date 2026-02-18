/**
 * Sparkline Utility
 * 
 * Draws a lightweight phosphor-style line graph on a canvas element.
 */

export class Sparkline {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private data: number[] = [];
    private maxPoints: number;
    private color: string;

    constructor(containerId: string, maxPoints: number = 30, color: string = '#00ffff') {
        const container = document.getElementById(containerId);
        if (!container) throw new Error(`Container ${containerId} not found`);

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d')!;
        this.maxPoints = maxPoints;
        this.color = color;

        // Make canvas fill container
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        container.appendChild(this.canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    public resize() {
        const rect = this.canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            this.canvas.width = rect.width;
            this.canvas.height = rect.height || 100;
        }
        this.draw();
    }

    public addPoint(value: number) {
        this.data.push(value);
        if (this.data.length > this.maxPoints) {
            this.data.shift();
        }
        this.draw();
    }

    private draw() {
        const { width, height } = this.canvas;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        if (this.data.length < 2) return;

        // Draw phosphor grid
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw the line
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';

        // Glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;

        const xStep = width / (this.maxPoints - 1);
        const min = Math.min(...this.data) * 0.9;
        const max = Math.max(...this.data) * 1.1;
        const range = max - min;

        this.data.forEach((val, i) => {
            const x = i * xStep;
            const y = height - ((val - min) / range) * height;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        // Reset shadow for next draw
        ctx.shadowBlur = 0;
    }
}
