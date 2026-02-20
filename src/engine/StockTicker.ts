/**
 * Market Intelligence Engine
 * 
 * Simulates the 1929-1933 stock market collapse with historical anchors.
 */

export interface StockInfo {
    symbol: string;
    company: string;
    startPrice: number;
    currentPrice: number;
    change: number;
    history: number[];
}

export class StockTicker {
    private stocks: StockInfo[] = [
        { symbol: 'DOW', company: 'DJ Industrial Average', startPrice: 381.17, currentPrice: 381.17, change: 0, history: [] },
        { symbol: 'X', company: 'US Steel', startPrice: 261.75, currentPrice: 261.75, change: 0, history: [] },
        { symbol: 'GE', company: 'General Electric', startPrice: 403.00, currentPrice: 403.00, change: 0, history: [] },
        { symbol: 'RCA', company: 'Radio Corp of America', startPrice: 114.75, currentPrice: 114.75, change: 0, history: [] },
        { symbol: 'M', company: 'Montgomery Ward', startPrice: 156.80, currentPrice: 156.80, change: 0, history: [] }
    ];

    constructor() {
        this.generateHistoricalSeed();
    }

    private generateHistoricalSeed(): void {
        const points = 2000;
        const seedHistory: number[] = [];

        // Accurate DOW Anchors (Synthesized Monthly/Yearly)
        const anchors = [
            { pos: 0, val: 95.0 },    // Jan 1924
            { pos: 400, val: 110.0 },  // Jan 1925
            { pos: 800, val: 155.0 },  // Jan 1926
            { pos: 1200, val: 155.0 }, // Jan 1927
            { pos: 1600, val: 200.0 }, // Jan 1928
            { pos: 1750, val: 220.0 }, // Jun 1928
            { pos: 1850, val: 280.0 }, // Nov 1928
            { pos: 1900, val: 300.0 }, // Jan 1929
            { pos: 1940, val: 315.0 }, // Mar 1929
            { pos: 1970, val: 325.0 }, // May 1929
            { pos: 2000, val: 341.0 }  // Jul 1, 1929
        ];

        let currentAnchorIndex = 0;
        let val = anchors[0].val;

        for (let i = 0; i < points; i++) {
            if (currentAnchorIndex < anchors.length - 1 && i >= anchors[currentAnchorIndex + 1].pos) {
                currentAnchorIndex++;
            }

            const nextAnchor = anchors[currentAnchorIndex + 1] || anchors[currentAnchorIndex];
            const currentAnchor = anchors[currentAnchorIndex];
            const segmentLen = nextAnchor.pos - currentAnchor.pos || 1;
            const progress = (i - currentAnchor.pos) / segmentLen;

            // Targeted drift to hit the next anchor
            const targetVal = currentAnchor.val + (nextAnchor.val - currentAnchor.val) * progress;
            const deviation = (val - targetVal);
            const correction = -deviation * 0.1; // Pull towards target path

            const volatility = 0.8;
            val += (Math.random() - 0.5) * volatility + correction;

            // Scale noise based on index value
            const noise = (Math.random() - 0.5) * (val * 0.005);
            seedHistory.push(val + noise);
        }

        // Apply seed to stocks (scaled)
        this.stocks.forEach(stock => {
            const scale = stock.startPrice / 381.17; // Scale relative to DOW peak
            stock.history = seedHistory.map(v => v * scale);
            stock.currentPrice = stock.history[stock.history.length - 1];
        });
    }

    private crashDate = new Date('1929-10-24');

    /**
     * Update all stock prices based on the current date and "Market Gravity"
     */
    public update(currentDate: Date): StockInfo[] {

        // Market Phase Logic
        let marketGravity = 1.0;
        if (currentDate >= new Date('1932-07-01')) {
            marketGravity = 0.12; // The absolute bottom
        } else if (currentDate >= new Date('1931-01-01')) {
            marketGravity = 0.35; // Severe depression
        } else if (currentDate >= new Date('1929-10-29')) {
            marketGravity = 0.70; // Post-crash panic
        } else if (currentDate >= this.crashDate) {
            marketGravity = 0.85; // Initial crash
        }

        // Brownian Motion + Historical Drift
        this.stocks.forEach(stock => {
            const drift = (stock.startPrice * marketGravity);
            const noise = (Math.random() - 0.5) * (stock.startPrice * 0.02);

            const prevPrice = stock.currentPrice;
            stock.currentPrice = Math.max(1.5, drift + noise);
            stock.change = ((stock.currentPrice - prevPrice) / prevPrice) * 100;

            stock.history.push(stock.currentPrice);
            if (stock.history.length > 2000) stock.history.shift();
        });

        return this.stocks;
    }

    public getStocks(): StockInfo[] {
        return this.stocks;
    }
}
