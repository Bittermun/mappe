import { Sparkline } from './Sparkline';
import { TradeBureau, TradeSnapshot } from '../engine/TradeBureau';

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

    private dowHistory: number[] = [];
    private currentTimeframe: '1Y' | '5Y' | 'MAX' = '1Y';
    private currentTheaterTab: 'MARKET' | 'TRADE' = 'MARKET';
    private tradeBureau: TradeBureau;

    // Trade UI Elements
    private marketBoard: HTMLElement | null;
    private tradeBoard: HTMLElement | null;
    private tradeTotalVal: HTMLElement | null;
    private exportBarChart: HTMLElement | null;
    private partnerPieChart: HTMLElement | null;
    private partnerLegend: HTMLElement | null;

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

        // Trade Elements
        this.tradeBureau = new TradeBureau();
        this.marketBoard = document.getElementById('market-board');
        this.tradeBoard = document.getElementById('trade-board');
        this.tradeTotalVal = document.getElementById('trade-total-val');
        this.exportBarChart = document.getElementById('export-bar-chart');
        this.partnerPieChart = document.getElementById('partner-pie-chart');
        this.partnerLegend = document.getElementById('partner-legend');

        // Initialize Sparklines
        try {
            this.economicGraph = new Sparkline('economic-mini-graph', 50, '#00ffff');
            this.marketLargeGraph = new Sparkline('market-large-graph', 365, '#00ffff');
        } catch (e) {
            console.warn('[FlightDeck] Sparkline containers not found');
        }

        this.setupTimeframeControls();
        this.setupTabControls();
    }

    private setupTabControls(): void {
        const tabMkt = document.getElementById('tab-market');
        const tabTrd = document.getElementById('tab-trade');

        tabMkt?.addEventListener('click', () => this.switchTheaterTab('MARKET'));
        tabTrd?.addEventListener('click', () => this.switchTheaterTab('TRADE'));
    }

    public switchTheaterTab(tab: 'MARKET' | 'TRADE'): void {
        this.currentTheaterTab = tab;

        if (tab === 'MARKET') {
            this.marketBoard?.classList.remove('hidden');
            this.tradeBoard?.classList.add('hidden');
            document.getElementById('tab-market')?.classList.add('active');
            document.getElementById('tab-trade')?.classList.remove('active');
            // Force resize graph
            setTimeout(() => this.marketLargeGraph?.resize(), 50);
        } else {
            this.marketBoard?.classList.add('hidden');
            this.tradeBoard?.classList.remove('hidden');
            document.getElementById('tab-market')?.classList.remove('active');
            document.getElementById('tab-trade')?.classList.add('active');
        }
    }

    private setupTimeframeControls(): void {
        const tf1y = document.getElementById('tf-1y');
        const tf5y = document.getElementById('tf-5y');
        const tfMax = document.getElementById('tf-max');

        tf1y?.addEventListener('click', () => this.setTimeframe('1Y'));
        tf5y?.addEventListener('click', () => this.setTimeframe('5Y'));
        tfMax?.addEventListener('click', () => this.setTimeframe('MAX'));
    }

    public setTimeframe(tf: '1Y' | '5Y' | 'MAX'): void {
        this.currentTimeframe = tf;

        // Update UI states
        ['tf-1y', 'tf-5y', 'tf-max'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                if (id === `tf-${tf.toLowerCase()}`) btn.classList.add('active');
                else btn.classList.remove('active');
            }
        });

        // Update Gauge/Graph
        if (this.marketLargeGraph) {
            let dataSlice: number[] = [];
            let points = 365;

            if (tf === '1Y') {
                dataSlice = this.dowHistory.slice(-365);
                points = 365;
            } else if (tf === '5Y') {
                dataSlice = this.dowHistory.slice(-1825);
                points = 1825;
            } else {
                dataSlice = [...this.dowHistory];
                points = Math.max(365, this.dowHistory.length);
            }

            this.marketLargeGraph.setMaxPoints(points);
            this.marketLargeGraph.setData(dataSlice);
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

        // Update Trade Bureau
        this.updateTradeBureau(date);
    }

    private updateTradeBureau(date: Date): void {
        const snapshot = this.tradeBureau.getSnapshot(date);

        if (this.tradeTotalVal) {
            this.tradeTotalVal.textContent = `$${snapshot.totalVolume.toFixed(2)}B`;
        }

        this.renderExportBars(snapshot.exports);
        this.renderPartnerPie(snapshot.partners);
    }

    private renderExportBars(exports: any[]): void {
        if (!this.exportBarChart) return;

        const maxVal = Math.max(...exports.map(e => e.value));

        this.exportBarChart.innerHTML = exports.map(e => {
            const perc = (e.value / maxVal) * 100;
            return `
                <div class="bar-row">
                    <div class="bar-label">
                        <span>${e.label}</span>
                        <span>$${e.value.toFixed(2)}B</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${perc}%; background: ${e.color}; box-shadow: 0 0 10px ${e.color}"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    private renderPartnerPie(partners: any[]): void {
        if (!this.partnerPieChart || !this.partnerLegend) return;

        const total = partners.reduce((acc, p) => acc + p.value, 0);
        let currentPerc = 0;

        const gradient = partners.map(p => {
            const start = currentPerc;
            const perc = (p.value / total) * 100;
            currentPerc += perc;
            return `${p.color} ${start.toFixed(1)}% ${currentPerc.toFixed(1)}%`;
        }).join(', ');

        this.partnerPieChart.style.background = `conic-gradient(${gradient})`;

        this.partnerLegend.innerHTML = partners.map(p => `
            <div class="legend-item">
                <div class="legend-color" style="background: ${p.color}"></div>
                <span>${p.label} (${((p.value / total) * 100).toFixed(0)}%)</span>
            </div>
        `).join('');
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

                // Initialize history from seed if empty
                if (this.dowHistory.length === 0 && dow.history.length > 0) {
                    this.dowHistory = [...dow.history];
                } else {
                    this.dowHistory.push(dow.currentPrice);
                    if (this.dowHistory.length > 2000) this.dowHistory.shift();
                }

                if (this.marketLargeGraph) {
                    const tf = this.currentTimeframe;
                    let dataSlice: number[] = [];
                    if (tf === '1Y') dataSlice = this.dowHistory.slice(-365);
                    else if (tf === '5Y') dataSlice = this.dowHistory.slice(-1825);
                    else dataSlice = [...this.dowHistory];

                    this.marketLargeGraph.setData(dataSlice);
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
