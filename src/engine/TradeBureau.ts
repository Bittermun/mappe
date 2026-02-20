/**
 * Trade Bureau Engine
 * 
 * Simulates US export/import statistics and trading partner data (1929-1933).
 */

export interface TradeSnapshot {
    totalVolume: number; // In Billions USD
    exports: { label: string; value: number; color: string }[];
    partners: { label: string; value: number; color: string }[];
}

export class TradeBureau {
    private baselineVolume = 5.24; // 1929 Total Exports in Billions
    private exportsData = [
        { label: 'COTTON', weight: 0.15, color: '#00ffff' },
        { label: 'MACHINERY', weight: 0.12, color: '#00cccc' },
        { label: 'AUTO', weight: 0.10, color: '#009999' },
        { label: 'PETROL', weight: 0.10, color: '#007777' },
        { label: 'WHEAT', weight: 0.05, color: '#005555' },
        { label: 'OTHER', weight: 0.48, color: '#004444' }
    ];

    private partnersData = [
        { label: 'UK', weight: 0.18, color: '#00ffff' },
        { label: 'CANADA', weight: 0.18, color: '#008888' },
        { label: 'GERMANY', weight: 0.10, color: '#00aaaa' },
        { label: 'JAPAN', weight: 0.05, color: '#006666' },
        { label: 'FRANCE', weight: 0.05, color: '#004444' },
        { label: 'OTHER', weight: 0.44, color: '#002222' }
    ];

    public getSnapshot(currentDate: Date): TradeSnapshot {
        // Trade volume collapse simulation
        // 1929 (~$5.2B) -> 1932 (~$1.6B)
        const start = new Date('1929-01-01').getTime();
        const bottom = new Date('1932-12-31').getTime();
        const current = currentDate.getTime();

        let multiplier = 1.0;
        if (current > start) {
            const progress = Math.min(1, (current - start) / (bottom - start));
            // Trade collapsed faster than GDP due to Smoot-Hawley (1930)
            multiplier = 1.0 - (progress * 0.7);
        }

        const currentVolume = this.baselineVolume * multiplier;

        return {
            totalVolume: currentVolume,
            exports: this.exportsData.map(e => ({
                label: e.label,
                value: currentVolume * e.weight,
                color: e.color
            })),
            partners: this.partnersData.map(p => ({
                label: p.label,
                value: currentVolume * p.weight,
                color: p.color
            }))
        };
    }
}
