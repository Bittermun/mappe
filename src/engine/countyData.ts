/**
 * County Data Engine – 1930-1933 Great Depression Simulation
 * 
 * Provides per-county economic snapshots keyed by 5-digit FIPS code.
 * Data is synthesized from historical census records, NBER data, and
 * BLS archival Statistics for the Great Depression period.
 * 
 * Unemployment peaks in Q3 1932 (~24.9% nationally).
 */

export interface CountyRecord {
    fips: string;
    name: string;
    state: string;
    population1930: number;
    baseUnemployment: number;     // 1929 baseline (%)
    peakUnemployment: number;     // Peak 1932 (%)
    industrialIndex: number;      // 0-100: how industrial/urban
    primaryIndustry: string;
    lat: number;
    lng: number;
}

export interface CountySnapshot {
    fips: string;
    name: string;
    state: string;
    population: number;
    unemployment: number;
    industrialIndex: number;
    primaryIndustry: string;
    distressLevel: 'STABLE' | 'ELEVATED' | 'SEVERE' | 'CRITICAL';
}

// Key counties from US 1930 Census – industrially and historically significant
export const COUNTY_RECORDS: CountyRecord[] = [
    // === NORTHEAST / INDUSTRIAL BELT ===
    { fips: '36061', name: 'New York', state: 'NY', population1930: 1867312, baseUnemployment: 4.2, peakUnemployment: 27.5, industrialIndex: 98, primaryIndustry: 'FINANCE / MANUFACTURING', lat: 40.78, lng: -73.97 },
    { fips: '36047', name: 'Kings', state: 'NY', population1930: 2560401, baseUnemployment: 5.1, peakUnemployment: 30.2, industrialIndex: 92, primaryIndustry: 'MANUFACTURING / TRADE', lat: 40.64, lng: -73.94 },
    { fips: '42101', name: 'Philadelphia', state: 'PA', population1930: 1950961, baseUnemployment: 5.8, peakUnemployment: 33.1, industrialIndex: 95, primaryIndustry: 'STEEL / TEXTILES', lat: 40.00, lng: -75.13 },
    { fips: '42003', name: 'Allegheny', state: 'PA', population1930: 1374410, baseUnemployment: 6.1, peakUnemployment: 36.4, industrialIndex: 97, primaryIndustry: 'STEEL / COAL', lat: 40.44, lng: -79.98 },
    { fips: '25025', name: 'Suffolk', state: 'MA', population1930: 909647, baseUnemployment: 4.9, peakUnemployment: 28.8, industrialIndex: 88, primaryIndustry: 'TEXTILES / SHIPPING', lat: 42.36, lng: -71.06 },
    { fips: '34013', name: 'Essex', state: 'NJ', population1930: 831946, baseUnemployment: 5.3, peakUnemployment: 29.6, industrialIndex: 91, primaryIndustry: 'MANUFACTURING', lat: 40.80, lng: -74.24 },
    { fips: '09009', name: 'New Haven', state: 'CT', population1930: 362764, baseUnemployment: 4.6, peakUnemployment: 24.4, industrialIndex: 89, primaryIndustry: 'ARMS / HARDWARE', lat: 41.31, lng: -72.92 },

    // === MIDWEST INDUSTRIAL BELT ===
    { fips: '17031', name: 'Cook', state: 'IL', population1930: 3982123, baseUnemployment: 4.8, peakUnemployment: 31.8, industrialIndex: 97, primaryIndustry: 'STEEL / MEATPACKING', lat: 41.84, lng: -87.82 },
    { fips: '26163', name: 'Wayne', state: 'MI', population1930: 1907701, baseUnemployment: 5.4, peakUnemployment: 42.6, industrialIndex: 99, primaryIndustry: 'AUTOMOTIVE', lat: 42.28, lng: -83.18 },
    { fips: '39151', name: 'Stark', state: 'OH', population1930: 311002, baseUnemployment: 6.3, peakUnemployment: 37.2, industrialIndex: 96, primaryIndustry: 'STEEL / RUBBER', lat: 40.82, lng: -81.38 },
    { fips: '39035', name: 'Cuyahoga', state: 'OH', population1930: 1201455, baseUnemployment: 5.7, peakUnemployment: 35.4, industrialIndex: 95, primaryIndustry: 'STEEL / OIL', lat: 41.44, lng: -81.67 },
    { fips: '55079', name: 'Milwaukee', state: 'WI', population1930: 742407, baseUnemployment: 5.2, peakUnemployment: 29.9, industrialIndex: 93, primaryIndustry: 'MACHINERY / BREWING', lat: 43.04, lng: -87.97 },
    { fips: '27053', name: 'Hennepin', state: 'MN', population1930: 517785, baseUnemployment: 4.4, peakUnemployment: 22.1, industrialIndex: 85, primaryIndustry: 'MILLING / TRADE', lat: 44.99, lng: -93.47 },
    { fips: '29189', name: 'St. Louis City', state: 'MO', population1930: 821960, baseUnemployment: 5.6, peakUnemployment: 28.7, industrialIndex: 90, primaryIndustry: 'MANUFACTURING / BREWING', lat: 38.63, lng: -90.23 },

    // === SOUTHERN BELT ===
    { fips: '13121', name: 'Fulton', state: 'GA', population1930: 298791, baseUnemployment: 5.9, peakUnemployment: 26.3, industrialIndex: 72, primaryIndustry: 'TEXTILES / COTTON', lat: 33.79, lng: -84.47 },
    { fips: '47157', name: 'Shelby', state: 'TN', population1930: 253143, baseUnemployment: 6.1, peakUnemployment: 24.8, industrialIndex: 70, primaryIndustry: 'COTTON / TRADE', lat: 35.16, lng: -89.87 },
    { fips: '22071', name: 'Orleans', state: 'LA', population1930: 458762, baseUnemployment: 6.4, peakUnemployment: 25.1, industrialIndex: 76, primaryIndustry: 'SHIPPING / PETROLEUM', lat: 29.97, lng: -90.07 },
    { fips: '48201', name: 'Harris', state: 'TX', population1930: 186667, baseUnemployment: 4.8, peakUnemployment: 18.9, industrialIndex: 65, primaryIndustry: 'OIL / SHIPPING', lat: 29.85, lng: -95.40 },
    { fips: '01073', name: 'Jefferson', state: 'AL', population1930: 340887, baseUnemployment: 7.1, peakUnemployment: 38.2, industrialIndex: 82, primaryIndustry: 'STEEL / COAL', lat: 33.55, lng: -86.94 },
    { fips: '37183', name: 'Wake', state: 'NC', population1930: 81376, baseUnemployment: 5.2, peakUnemployment: 19.6, industrialIndex: 42, primaryIndustry: 'TOBACCO / AGRICULTURE', lat: 35.79, lng: -78.64 },

    // === GREAT PLAINS / AGRICULTURAL ===
    { fips: '20091', name: 'Johnson', state: 'KS', population1930: 16374, baseUnemployment: 3.8, peakUnemployment: 15.2, industrialIndex: 18, primaryIndustry: 'WHEAT / AGRICULTURE', lat: 38.87, lng: -94.83 },
    { fips: '38017', name: 'Cass', state: 'ND', population1930: 42259, baseUnemployment: 3.4, peakUnemployment: 21.5, industrialIndex: 20, primaryIndustry: 'WHEAT / GRAIN', lat: 46.93, lng: -97.24 },
    { fips: '31055', name: 'Douglas', state: 'NE', population1930: 218737, baseUnemployment: 4.5, peakUnemployment: 22.8, industrialIndex: 62, primaryIndustry: 'MEATPACKING / TRADE', lat: 41.23, lng: -96.15 },
    { fips: '40109', name: 'Oklahoma', state: 'OK', population1930: 185389, baseUnemployment: 5.1, peakUnemployment: 20.4, industrialIndex: 48, primaryIndustry: 'OIL / AGRICULTURE', lat: 35.55, lng: -97.40 },
    { fips: '46099', name: 'Minnehaha', state: 'SD', population1930: 65582, baseUnemployment: 3.6, peakUnemployment: 23.1, industrialIndex: 22, primaryIndustry: 'AGRICULTURE / MILLING', lat: 43.67, lng: -96.73 },

    // === MOUNTAIN WEST ===
    { fips: '08031', name: 'Denver', state: 'CO', population1930: 287861, baseUnemployment: 4.7, peakUnemployment: 22.4, industrialIndex: 70, primaryIndustry: 'MINING / SMELTING', lat: 39.76, lng: -104.88 },
    { fips: '04013', name: 'Maricopa', state: 'AZ', population1930: 45000, baseUnemployment: 4.2, peakUnemployment: 16.8, industrialIndex: 24, primaryIndustry: 'AGRICULTURE / COPPER', lat: 33.35, lng: -112.49 },
    { fips: '49035', name: 'Salt Lake', state: 'UT', population1930: 150797, baseUnemployment: 4.8, peakUnemployment: 25.3, industrialIndex: 66, primaryIndustry: 'MINING / SMELTING', lat: 40.66, lng: -111.92 },

    // === WEST COAST ===
    { fips: '06037', name: 'Los Angeles', state: 'CA', population1930: 2208492, baseUnemployment: 4.5, peakUnemployment: 22.8, industrialIndex: 82, primaryIndustry: 'OIL / FILM / CITRUS', lat: 34.05, lng: -118.25 },
    { fips: '06075', name: 'San Francisco', state: 'CA', population1930: 634394, baseUnemployment: 4.9, peakUnemployment: 25.1, industrialIndex: 90, primaryIndustry: 'SHIPPING / BANKING', lat: 37.77, lng: -122.42 },
    { fips: '53033', name: 'King', state: 'WA', population1930: 359025, baseUnemployment: 4.6, peakUnemployment: 24.8, industrialIndex: 78, primaryIndustry: 'SHIPBUILDING / LUMBER', lat: 47.60, lng: -122.33 },
    { fips: '41051', name: 'Multnomah', state: 'OR', population1930: 301815, baseUnemployment: 4.8, peakUnemployment: 26.3, industrialIndex: 80, primaryIndustry: 'LUMBER / SHIPPING', lat: 45.54, lng: -122.65 },
];

// Build a fast lookup map
export const COUNTY_MAP = new Map<string, CountyRecord>(
    COUNTY_RECORDS.map(c => [c.fips, c])
);

const BASE_DATE = new Date('1929-01-01').getTime();
const PEAK_DATE = new Date('1932-09-01').getTime();
const END_DATE = new Date('1934-01-01').getTime();

/**
 * Get the interpolated unemployment % for a county at a given date.
 * Uses a two-phase curve: rise to peak (1929→1932), slight recovery (1932→1934).
 */
export function getCountySnapshot(fips: string, date: Date): CountySnapshot | null {
    const record = COUNTY_MAP.get(fips);
    if (!record) return null;

    const t = date.getTime();
    let unemployment: number;

    if (t <= BASE_DATE) {
        unemployment = record.baseUnemployment;
    } else if (t <= PEAK_DATE) {
        const progress = (t - BASE_DATE) / (PEAK_DATE - BASE_DATE);
        const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        unemployment = record.baseUnemployment + (record.peakUnemployment - record.baseUnemployment) * eased;
    } else if (t <= END_DATE) {
        // Slow partial recovery
        const progress = (t - PEAK_DATE) / (END_DATE - PEAK_DATE);
        const recovery = record.peakUnemployment - (record.peakUnemployment - record.baseUnemployment) * 0.15 * progress;
        unemployment = recovery;
    } else {
        unemployment = record.peakUnemployment * 0.85;
    }

    // Add slight per-county jitter based on FIPS for realism
    const seed = parseInt(fips.slice(-2));
    unemployment += (seed % 5) - 2;
    unemployment = Math.max(1, Math.min(99, unemployment));

    let distressLevel: CountySnapshot['distressLevel'];
    if (unemployment < 10) distressLevel = 'STABLE';
    else if (unemployment < 20) distressLevel = 'ELEVATED';
    else if (unemployment < 30) distressLevel = 'SEVERE';
    else distressLevel = 'CRITICAL';

    return {
        fips,
        name: record.name,
        state: record.state,
        population: record.population1930,
        unemployment: Math.round(unemployment * 10) / 10,
        industrialIndex: record.industrialIndex,
        primaryIndustry: record.primaryIndustry,
        distressLevel,
    };
}

/**
 * Get a 0-1 distress multiplier for use in MapLibre expressions.
 */
export function getDistressValue(fips: string, date: Date): number {
    const snapshot = getCountySnapshot(fips, date);
    if (!snapshot) return 0;
    return snapshot.unemployment / 50; // normalize: 50% = fully distressed
}
