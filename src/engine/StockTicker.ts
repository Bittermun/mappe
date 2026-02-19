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
