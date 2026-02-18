import { Sparkline } from './Sparkline';

export class FlightDeck {
    private dateEl: HTMLElement | null;
    private altitudeEl: HTMLElement | null;
    private modeEl: HTMLElement | null;
    private zoomEl: HTMLElement | null;

    // Timeline progress bar elements
    private progressFill: HTMLElement | null;
    private progressThumb: HTMLElement | null;
    private progressStartLabel: HTMLElement | null;
    private progressEndLabel: HTMLElement | null;

    // TNO Gauges & Panels
    private gdpGauge: HTMLElement | null;
    private gdpVal: HTMLElement | null;
    private socialGauge: HTMLElement | null;
    private socialVal: HTMLElement | null;
    private tickerTape: HTMLElement | null;
    private stockList: HTMLElement | null;
    private stockListLarge: HTMLElement | null;
    private marketTheater: HTMLElement | null;
    private probeHUD: HTMLElement | null;
    private regionInfoContent: HTMLElement | null;
    private dowValBg: HTMLElement | null;

    private economicGraph: Sparkline | null = null;
    private marketLargeGraph: Sparkline | null = null;

    // Timeline boundaries
    private startDate: Date | null = null;
    private endDate: Date | null = null;

    constructor() {
        this.dateEl = document.getElementById('date-val');
        this.altitudeEl = document.getElementById('altitude-val');
        this.modeEl = document.getElementById('mode-val');
        this.zoomEl = document.getElementById('zoom-val');

        // Progress bar elements
        this.progressFill = document.getElementById('timeline-fill');
        this.progressThumb = document.getElementById('timeline-thumb');
        this.progressStartLabel = document.getElementById('timeline-start');
        this.progressEndLabel = document.getElementById('timeline-end');

        // TNO Elements
        this.gdpGauge = document.getElementById('gdp-gauge');
        this.gdpVal = document.getElementById('gdp-val');
        this.socialGauge = document.getElementById('social-gauge');
        this.socialVal = document.getElementById('social-val');
        this.tickerTape = document.getElementById('ticker-tape');
        this.stockList = document.getElementById('stock-list');
        this.stockListLarge = document.getElementById('stock-list-large');
        this.marketTheater = document.getElementById('market-operations-theater');
        this.dowValBg = document.getElementById('dow-val-bg');
        this.probeHUD = document.getElementById('probe-hud');
        this.regionInfoContent = document.getElementById('region-info-content');

        // Initialize Sparklines
        try {
            this.economicGraph = new Sparkline('economic-mini-graph', 50, '#00ffff');
            this.marketLargeGraph = new Sparkline('market-large-graph', 100, '#00ffff');
        } catch (e) {
            console.warn('[FlightDeck] Sparkline containers not found');
        }
    }

    /**
     * Set the scenario's time boundaries for progress calculation.
     */
    public setTimelineBounds(start: Date, end: Date): void {
        this.startDate = start;
        this.endDate = end;

        if (this.progressStartLabel) {
            this.progressStartLabel.textContent = String(start.getFullYear());
        }
        if (this.progressEndLabel) {
            this.progressEndLabel.textContent = String(end.getFullYear());
        }
    }

    public updateDate(date: Date): void {
        if (this.dateEl) {
            this.dateEl.textContent = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).toUpperCase();
        }

        // Update progress bar
        this.updateProgress(date);
    }

    /**
     * Compute and render timeline progress: (current - start) / (end - start)
     */
    private updateProgress(current: Date): void {
        if (!this.startDate || !this.endDate) return;

        const total = this.endDate.getTime() - this.startDate.getTime();
        if (total <= 0) return;

        const elapsed = current.getTime() - this.startDate.getTime();
        const ratio = Math.max(0, Math.min(1, elapsed / total));
        const percent = ratio * 100;

        if (this.progressFill) {
            this.progressFill.style.width = `${percent}%`;
        }
        if (this.progressThumb) {
            this.progressThumb.style.left = `${percent}%`;
        }
    }

    public updateAltitude(zoom: number): void {
        if (this.zoomEl) {
            this.zoomEl.textContent = zoom.toFixed(1);
        }

        if (this.altitudeEl) {
            const altitudeMeters = 40075000 / Math.pow(2, zoom);
            const altitudeFeet = altitudeMeters * 3.28084;

            if (altitudeFeet > 50000) {
                const miles = altitudeFeet / 5280;
                this.altitudeEl.textContent = miles >= 1000
                    ? `${(miles / 1000).toFixed(0)}K MI`
                    : `${miles.toFixed(0)} MI`;
            } else {
                this.altitudeEl.textContent = `${(altitudeFeet / 1000).toFixed(0)}K FT`;
            }
        }
    }

    public setMode(mode: string): void {
        if (this.modeEl) {
            this.modeEl.textContent = mode.toUpperCase();
        }
    }

    /**
     * Update the historical stock ticker list (both compact and theater)
     */
    public updateStocks(stocks: any[]): void {
        const renderStock = (s: any) => {
            const isUp = s.change >= 0;
            return `
                <div class="stock-item ${isUp ? 'up' : 'down'}">
                    <span class="symbol">${s.symbol}</span>
                    <span class="company">${s.company}</span>
                    <span class="price">${s.currentPrice.toFixed(2)}</span>
                    <span class="change">${isUp ? '+' : ''}${s.change.toFixed(2)}%</span>
                </div>
            `;
        };

        if (this.stockList) {
            this.stockList.innerHTML = stocks.map(renderStock).join('');
        }

        if (this.stockListLarge) {
            this.stockListLarge.innerHTML = stocks.map(renderStock).join('');
        }

        // Update DOW Large Display
        if (this.dowValBg && stocks.length > 0) {
            const dow = stocks.find(s => s.symbol === 'DOW');
            if (dow) {
                this.dowValBg.textContent = dow.currentPrice.toFixed(2);
                if (this.marketLargeGraph) {
                    this.marketLargeGraph.addPoint(dow.currentPrice);
                }
            }
        }
    }

    public toggleMarketTheater(show: boolean): void {
        if (this.marketTheater) {
            if (show) {
                this.marketTheater.classList.remove('hidden');
                setTimeout(() => {
                    if (this.marketLargeGraph) this.marketLargeGraph.resize();
                }, 50);
            } else {
                this.marketTheater.classList.add('hidden');
            }
        }
    }

    /**
     * Add a signal to the historical ticker
     */
    public addSignal(title: string, date: Date): void {
        if (!this.tickerTape) return;

        // Remove placeholder if it exists
        const placeholder = this.tickerTape.querySelector('.placeholder');
        if (placeholder) placeholder.remove();

        const entry = document.createElement('div');
        entry.className = 'ticker-entry';

        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
        entry.innerHTML = `<strong>${dateStr}</strong>: ${title}`;

        this.tickerTape.prepend(entry);

        // Keep only last 20 entries
        if (this.tickerTape.children.length > 20) {
            this.tickerTape.lastElementChild?.remove();
        }
    }

    /**
     * Update economic gauges
     */
    public updateGauges(gdpPerc: number, socialPerc: number): void {
        if (this.gdpGauge) this.gdpGauge.style.width = `${gdpPerc}%`;
        if (this.gdpVal) {
            // Simulated dollar value scaling for flavor
            const currentBillions = (54.45 * (gdpPerc / 100)).toFixed(2);
            this.gdpVal.textContent = `$${currentBillions}B`;
        }

        if (this.socialGauge) this.socialGauge.style.width = `${socialPerc}%`;
        if (this.socialVal) {
            this.socialVal.textContent = `${Math.round(socialPerc)}%`;
        }

        if (this.economicGraph) {
            this.economicGraph.addPoint(gdpPerc);
        }
    }

    /**
     * Update the POI probe telemetry panel
     */
    public updateProbe(html: string): void {
        if (this.regionInfoContent) {
            this.regionInfoContent.innerHTML = html;
        }

        if (this.probeHUD) {
            if (html.trim() && !html.includes('SELECT GEOGRAPHIC')) {
                this.probeHUD.classList.remove('hidden');
            } else {
                this.probeHUD.classList.add('hidden');
            }
        }
    }
}
