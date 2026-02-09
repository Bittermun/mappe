/**
 * County Data Types and Loader
 * 
 * Handles 1930 census data for US counties
 */

export interface CountyCensusData {
    fips: string;
    name: string;
    state: string;
    seatCity: string;
    population1930: number;
    population1920: number;
    populationChange: number;
    density: number;
    unemploymentEst1932: number;
    industries: string[];
    majorEmployers: string[];
    notes: string;
}

export interface CountyGeoFeature {
    type: 'Feature';
    properties: {
        fips: string;
        name: string;
        state: string;
        region: string;
    };
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
    };
}

export interface CountyGeoJSON {
    type: 'FeatureCollection';
    features: CountyGeoFeature[];
}

// Combined data for rendering
export interface CountyRenderData {
    fips: string;
    name: string;
    state: string;
    region: string;
    census: CountyCensusData | null;
    geometry: CountyGeoFeature['geometry'];
}

// Cache for loaded data
let censusData: Map<string, CountyCensusData> | null = null;
let geoData: CountyGeoJSON | null = null;

export async function loadCountyCensusData(): Promise<Map<string, CountyCensusData>> {
    if (censusData) return censusData;

    const response = await fetch('/data/scenarios/great-depression/county-census-1930.json');
    const data = await response.json();

    censusData = new Map();
    for (const county of data.counties) {
        censusData.set(county.fips, county);
    }

    console.log(`[CountyData] Loaded census data for ${censusData.size} counties`);
    return censusData;
}

export async function loadCountyGeoJSON(): Promise<CountyGeoJSON> {
    if (geoData) return geoData;

    const response = await fetch('/data/scenarios/great-depression/us-counties-sample.geojson');
    geoData = await response.json();

    console.log(`[CountyData] Loaded GeoJSON for ${geoData?.features.length || 0} counties`);
    return geoData!;
}

export async function getCountyRenderData(): Promise<CountyRenderData[]> {
    const [census, geo] = await Promise.all([
        loadCountyCensusData(),
        loadCountyGeoJSON()
    ]);

    return geo.features.map(feature => ({
        fips: feature.properties.fips,
        name: feature.properties.name,
        state: feature.properties.state,
        region: feature.properties.region,
        census: census.get(feature.properties.fips) || null,
        geometry: feature.geometry
    }));
}

export function getCensusData(fips: string): CountyCensusData | undefined {
    return censusData?.get(fips);
}

// Utility: Get unemployment severity color
export function getUnemploymentColor(rate: number): string {
    if (rate >= 45) return '#8B0000';      // Dark red - crisis
    if (rate >= 35) return '#DC143C';      // Crimson - severe
    if (rate >= 25) return '#FF6347';      // Tomato - high
    if (rate >= 15) return '#FFA500';      // Orange - moderate
    return '#32CD32';                       // Lime green - low
}

// Utility: Format population with commas
export function formatPopulation(pop: number): string {
    return pop.toLocaleString('en-US');
}
