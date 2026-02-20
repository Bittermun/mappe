import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// @ts-ignore
import mlcontour from 'maplibre-contour';
import { timelineEngine } from './engine/timeline';
import { loadGreatDepressionScenario } from './engine/scenarioLoader';
import { FlightDeck } from './ui/FlightDeck';
import { createTacticalRipple } from './visual/rippleEffect';
import { StockTicker } from './engine/StockTicker';
import { COUNTY_RECORDS, getCountySnapshot } from './engine/CountyData';

// === DEM SOURCE FOR CONTOURS ===
const demSource = new mlcontour.DemSource({
    url: 'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png',
    encoding: 'terrarium',
    maxzoom: 13,
});
demSource.setupMaplibre(maplibregl);

let currentMode: 'satellite' | 'contour' = 'satellite';

// === UI COMPONENTS ===
const flightDeck = new FlightDeck();
const stockTicker = new StockTicker();

// === COUNTY MODE STATE ===
let countyModeActive = false;
let countyLayersLoaded = false;
let selectedCountyFips: string | null = null;

// === TIMELINE STATE ===
let isPlaying = false;
let playInterval: number | null = null;
const PLAY_SPEED_MS = 500; // Advance time every 500ms when playing

function updateDateDisplay(): void {
    const date = timelineEngine.getCurrentDate();
    flightDeck.updateDate(date);

    // Scenario title is outside FlightDeck scope for now, or could be added
    const titleEl = document.getElementById('scenario-title');
    if (titleEl) {
        const scenario = timelineEngine.getScenario();
        titleEl.textContent = scenario?.name || 'LOADING SCENARIO...';
    }

    // Refresh county panel if a county is selected
    if (selectedCountyFips) {
        updateCountyPanel(selectedCountyFips);
    }
}

function showToast(title: string, description: string, date: Date): void {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-title">📰 ${title}</div>
        <div class="toast-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div class="toast-description">${description.slice(0, 150)}${description.length > 150 ? '...' : ''}</div>
    `;

    container.appendChild(toast);

    // Remove after animation completes (5 seconds)
    setTimeout(() => toast.remove(), 5000);
}

function advanceTime(amount: 'day' | 'week' | 'month' | 'year' = 'day'): void {
    const events = timelineEngine.advanceTime(amount);
    updateDateDisplay();

    // Economic Logic: Simple systemic drift based on date (simulated for now)
    const currentDate = timelineEngine.getCurrentDate();
    const gdpBase = 100;
    const yearFactor = Math.max(0, (currentDate.getFullYear() - 1929) * 20 + (currentDate.getMonth() * 1.5));
    const currentGDP = Math.max(10, gdpBase - (currentDate >= new Date('1929-10-29') ? yearFactor : 0));
    const socialStability = Math.max(5, 85 - (currentGDP < 50 ? (50 - currentGDP) : 0));

    flightDeck.updateGauges(currentGDP, socialStability);

    // Update Stock Market Telemetry
    const stocks = stockTicker.update(currentDate);
    flightDeck.updateStocks(stocks);

    // Show toast and ticker for each triggered event
    for (const event of events) {
        showToast(event.title, event.description, new Date(event.timestamp));
        flightDeck.addSignal(event.title, new Date(event.timestamp));

        // Trigger Tactical Ripple and Auto-Zoom
        if (event.location && event.location.coordinates) {
            const coords: [number, number] = [
                event.location.coordinates[0],
                event.location.coordinates[1]
            ];

            createTacticalRipple(map, {
                center: coords,
                color: '#00ffff', // TNO Cyan
                maxRadius: 100,
                durationMs: 2000
            });

            map.flyTo({
                center: coords,
                zoom: 5,
                speed: 0.8,
                curve: 1,
                essential: true
            });
        }
    }

    // Re-color county layer if active
    if (countyModeActive && countyLayersLoaded) {
        updateCountyColors();
    }
}

function toggleAutoPlay(): void {
    isPlaying = !isPlaying;
    const playBtn = document.getElementById('play-btn');

    if (isPlaying) {
        if (playBtn) playBtn.textContent = '⏸ PAUSE';
        playInterval = window.setInterval(() => advanceTime('day'), PLAY_SPEED_MS);
    } else {
        if (playBtn) playBtn.textContent = '▶ PLAY';
        if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
        }
    }
}

// === STYLE CONFIGURATION ===
const contourStyle: maplibregl.StyleSpecification = {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
        dem: {
            type: 'raster-dem',
            encoding: 'terrarium',
            tiles: [demSource.sharedDemProtocolUrl],
            maxzoom: 13,
            tileSize: 256,
        },
        contours: {
            type: 'vector',
            tiles: [
                demSource.contourProtocolUrl({
                    multiplier: 1,
                    thresholds: {
                        8: [200, 500],
                        9: [100, 250],
                        10: [50, 100],
                        11: [25, 50],
                        12: [10, 25],
                        13: [5, 10],
                        14: [2, 5],
                    },
                    elevationKey: 'ele',
                    levelKey: 'level',
                    contourLayer: 'contours',
                }),
            ],
            maxzoom: 16,
        },
        openfree: {
            type: 'vector',
            url: 'https://tiles.openfreemap.org/planet'
        },
        ohm: {
            type: 'vector',
            tiles: ['https://vtiles.openhistoricalmap.org/maps/osm/{z}/{x}/{y}.pbf'],
            maxzoom: 14
        }
    },
    layers: [
        // === BACKGROUND ===
        { id: 'background', type: 'background', paint: { 'background-color': '#000000' } },

        // === HILLSHADE (terrain shading) ===
        {
            id: 'hillshade',
            type: 'hillshade',
            source: 'dem',
            paint: {
                'hillshade-illumination-direction': 315,
                'hillshade-exaggeration': 0.5,
                'hillshade-shadow-color': '#000818',
                'hillshade-highlight-color': '#2a5a6a',
                'hillshade-accent-color': '#1a3a4a'
            }
        },

        // === CONTOURS (DIM CYAN/BLUE) ===
        {
            id: 'contours-minor-glow',
            type: 'line',
            source: 'contours',
            'source-layer': 'contours',
            filter: ['==', ['get', 'level'], 0],
            paint: {
                'line-color': '#003344',
                'line-width': 2,
                'line-blur': 2,
                'line-opacity': 0.3
            },
            layout: { 'line-join': 'round' }
        },
        {
            id: 'contours-minor-core',
            type: 'line',
            source: 'contours',
            'source-layer': 'contours',
            filter: ['==', ['get', 'level'], 0],
            paint: {
                'line-color': '#006688',
                'line-width': 0.5,
                'line-opacity': 0.6
            },
            layout: { 'line-join': 'round' }
        },
        {
            id: 'contours-major-glow',
            type: 'line',
            source: 'contours',
            'source-layer': 'contours',
            filter: ['==', ['get', 'level'], 1],
            paint: {
                'line-color': '#004466',
                'line-width': 4,
                'line-blur': 3,
                'line-opacity': 0.4
            },
            layout: { 'line-join': 'round' }
        },
        {
            id: 'contours-major-core',
            type: 'line',
            source: 'contours',
            'source-layer': 'contours',
            filter: ['==', ['get', 'level'], 1],
            paint: {
                'line-color': '#0099bb',
                'line-width': 1,
                'line-opacity': 0.8
            },
            layout: { 'line-join': 'round' }
        },

        // === WATER (BLUE) ===
        {
            id: 'water-glow',
            type: 'line',
            source: 'openfree',
            'source-layer': 'water',
            paint: {
                'line-color': '#0044aa',
                'line-width': 5,
                'line-blur': 4,
                'line-opacity': 0.5
            }
        },
        {
            id: 'water-core',
            type: 'line',
            source: 'openfree',
            'source-layer': 'water',
            paint: {
                'line-color': '#0088ff',
                'line-width': 1.5,
                'line-opacity': 1
            }
        },

        // === ROADS (ORANGE GLOW) ===
        {
            id: 'roads-glow',
            type: 'line',
            source: 'openfree',
            'source-layer': 'transportation',
            minzoom: 4,
            paint: {
                'line-color': '#663300',
                'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.5, 8, 2, 12, 4, 14, 6],
                'line-blur': ['interpolate', ['linear'], ['zoom'], 4, 1, 10, 3],
                'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.2, 8, 0.3, 12, 0.4]
            }
        },
        {
            id: 'roads-core',
            type: 'line',
            source: 'openfree',
            'source-layer': 'transportation',
            minzoom: 4,
            paint: {
                'line-color': '#ff8800',
                'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.2, 8, 0.5, 12, 1, 14, 2],
                'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.4, 8, 0.6, 12, 0.8]
            }
        },

        // === HISTORICAL RAIL (AMBER STRATEGIC LINES - 1930) ===
        {
            id: 'rail-historical-glow',
            type: 'line',
            source: 'ohm',
            'source-layer': 'transportation',
            filter: [
                'all',
                ['==', ['get', 'class'], 'rail'],
                ['<=', ['get', 'start_decdate'], 1930.5],
                ['>=', ['get', 'end_decdate'], 1929.5]
            ],
            minzoom: 5,
            paint: {
                'line-color': '#664400',
                'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.5, 10, 4],
                'line-blur': 3,
                'line-opacity': 0.6
            }
        },
        {
            id: 'rail-historical-core',
            type: 'line',
            source: 'ohm',
            'source-layer': 'transportation',
            filter: [
                'all',
                ['==', ['get', 'class'], 'rail'],
                ['<=', ['get', 'start_decdate'], 1930.5],
                ['>=', ['get', 'end_decdate'], 1929.5]
            ],
            minzoom: 5,
            paint: {
                'line-color': '#ffaa00',
                'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.6, 10, 1.8],
                'line-opacity': 0.9,
                'line-dasharray': [3, 1]
            }
        },

        // === BUILDINGS/URBAN (BRIGHT ORANGE GLOW) ===
        {
            id: 'buildings-glow',
            type: 'line',
            source: 'openfree',
            'source-layer': 'building',
            minzoom: 13,
            paint: {
                'line-color': '#ff4400',
                'line-width': 3,
                'line-blur': 2,
                'line-opacity': 0.6
            }
        },
        {
            id: 'buildings-core',
            type: 'line',
            source: 'openfree',
            'source-layer': 'building',
            minzoom: 13,
            paint: {
                'line-color': '#ffaa00',
                'line-width': 0.8,
                'line-opacity': 1
            }
        },

        // === URBAN AREAS (RESIDENTIAL/COMMERCIAL) ===
        {
            id: 'urban-glow',
            type: 'line',
            source: 'openfree',
            'source-layer': 'landuse',
            filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'industrial']]],
            minzoom: 10,
            paint: {
                'line-color': '#cc4400',
                'line-width': 4,
                'line-blur': 4,
                'line-opacity': 0.5
            }
        },
        {
            id: 'urban-core',
            type: 'line',
            source: 'openfree',
            'source-layer': 'landuse',
            filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'industrial']]],
            minzoom: 10,
            paint: {
                'line-color': '#ffcc00',
                'line-width': 1.2,
                'line-opacity': 0.9
            }
        },

        // === PLACE LABELS ===
        {
            id: 'place-labels',
            type: 'symbol',
            source: 'openfree',
            'source-layer': 'place',
            minzoom: 8,
            layout: {
                'text-field': ['get', 'name'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 8, 10, 14, 16],
                'text-font': ['Noto Sans Bold']
            },
            paint: {
                'text-color': '#ffcc00',
                'text-halo-color': '#000000',
                'text-halo-width': 2,
                'text-halo-blur': 1
            }
        },
    ],
};

// === MAP INITIALIZATION ===
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [-96, 38],
    zoom: 4.5,
    pitch: 30,
    bearing: 0,
});

// === MODE TOGGLE ===
function toggleMode() {
    if (currentMode === 'satellite') {
        currentMode = 'contour';
        map.setStyle(contourStyle);
    } else {
        currentMode = 'satellite';
        map.setStyle('https://tiles.openfreemap.org/styles/liberty');
    }
    flightDeck.setMode(currentMode);
}

// === COUNTY MAP LAYER ===

/**
 * Build a GeoJSON FeatureCollection from county records + current date.
 * Each county becomes a Point that we'll use to drive Voronoi-approximated
 * circle markers (since full boundary shapefiles are too large to bundle).
 * We use a large circle radius to approximate county territories.
 */
function buildCountyGeoJSON(date: Date): GeoJSON.FeatureCollection {
    return {
        type: 'FeatureCollection',
        features: COUNTY_RECORDS.map(county => {
            const snapshot = getCountySnapshot(county.fips, date)!;
            const distCode = { STABLE: 0, ELEVATED: 1, SEVERE: 2, CRITICAL: 3 }[snapshot.distressLevel];
            return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [county.lng, county.lat] },
                properties: {
                    fips: county.fips,
                    name: county.name,
                    state: county.state,
                    unemployment: snapshot.unemployment,
                    distressCode: distCode,
                    industrialIndex: county.industrialIndex,
                    primaryIndustry: county.primaryIndustry,
                    population: county.population1930,
                }
            } as GeoJSON.Feature;
        })
    };
}

function updateCountyColors(): void {
    const date = timelineEngine.getCurrentDate();
    const geojson = buildCountyGeoJSON(date);
    (map.getSource('counties-points') as maplibregl.GeoJSONSource)?.setData(geojson);

    // Also refresh the selected panel
    if (selectedCountyFips) {
        updateCountyPanel(selectedCountyFips);
    }
}

function loadCountyLayers(): void {
    if (countyLayersLoaded) return;

    const date = timelineEngine.getCurrentDate();
    const geojson = buildCountyGeoJSON(date);

    // Add GeoJSON source
    map.addSource('counties-points', { type: 'geojson', data: geojson });

    // Outer glow (large, color-coded by distress)
    map.addLayer({
        id: 'county-glow',
        type: 'circle',
        source: 'counties-points',
        paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 20, 5, 40, 7, 70],
            'circle-blur': 0.9,
            'circle-opacity': 0.25,
            'circle-color': [
                'step', ['get', 'distressCode'],
                '#00ff88',   // 0: STABLE
                1, '#ffcc00', // 1: ELEVATED
                2, '#ff8800', // 2: SEVERE
                3, '#ff2200'  // 3: CRITICAL
            ]
        }
    }, 'county-border');

    // Core dot
    map.addLayer({
        id: 'county-core',
        type: 'circle',
        source: 'counties-points',
        paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 6, 5, 10, 7, 14],
            'circle-blur': 0.1,
            'circle-opacity': 0.9,
            'circle-color': [
                'step', ['get', 'distressCode'],
                '#00ff88',
                1, '#ffcc00',
                2, '#ff8800',
                3, '#ff2200'
            ],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#000818',
        }
    }, 'county-border');

    // Hover glow layer
    map.addLayer({
        id: 'county-hover',
        type: 'circle',
        source: 'counties-points',
        paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 8, 5, 14, 7, 18],
            'circle-blur': 0,
            'circle-opacity': 0,
            'circle-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0
        }
    });

    // Label layer
    map.addLayer({
        id: 'county-labels',
        type: 'symbol',
        source: 'counties-points',
        minzoom: 5,
        layout: {
            'text-field': ['get', 'name'],
            'text-size': 10,
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
        },
        paint: {
            'text-color': '#aaccff',
            'text-halo-color': '#000818',
            'text-halo-width': 2,
            'text-opacity': 0.85
        }
    });

    // ─── HOVER INTERACTIONS ───
    const tooltip = document.getElementById('county-tooltip')!;
    const tooltipName = document.getElementById('county-tooltip-name')!;
    const tooltipUnemp = document.getElementById('county-tooltip-unemp')!;

    let hoveredFips: string | null = null;

    map.on('mousemove', 'county-core', (e) => {
        if (!e.features || e.features.length === 0) return;
        map.getCanvas().style.cursor = 'pointer';

        const props = e.features[0].properties as any;
        hoveredFips = props.fips;

        tooltipName.textContent = `${props.name.toUpperCase()}, ${props.state}`;
        tooltipUnemp.textContent = `UNEMP: ${props.unemployment.toFixed(1)}%`;

        tooltip.style.left = `${e.originalEvent.clientX + 14}px`;
        tooltip.style.top = `${e.originalEvent.clientY - 10}px`;
        tooltip.classList.remove('hidden');

        map.setPaintProperty('county-hover', 'circle-stroke-opacity', [
            'case', ['==', ['get', 'fips'], hoveredFips], 1, 0
        ]);
    });

    map.on('mouseleave', 'county-core', () => {
        map.getCanvas().style.cursor = '';
        tooltip.classList.add('hidden');
        hoveredFips = null;
        map.setPaintProperty('county-hover', 'circle-stroke-opacity', 0);
    });

    // ─── CLICK INTERACTIONS ───
    map.on('click', 'county-core', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties as any;
        selectedCountyFips = props.fips;
        updateCountyPanel(props.fips);

        // Fly toward the county
        map.flyTo({
            center: [e.lngLat.lng, e.lngLat.lat],
            zoom: Math.max(map.getZoom(), 5.5),
            duration: 800,
            essential: true
        });
    });

    countyLayersLoaded = true;
    console.log('[County] Layers loaded');
}

function removeCountyLayers(): void {
    ['county-labels', 'county-hover', 'county-core', 'county-glow'].forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource('counties-points')) map.removeSource('counties-points');
    countyLayersLoaded = false;
    selectedCountyFips = null;
    document.getElementById('county-info-panel')?.classList.add('hidden');
}

function updateCountyPanel(fips: string): void {
    const date = timelineEngine.getCurrentDate();
    const snap = getCountySnapshot(fips, date);
    if (!snap) return;

    const panel = document.getElementById('county-info-panel')!;
    panel.classList.remove('hidden');

    document.getElementById('county-panel-name')!.textContent = snap.name.toUpperCase();
    document.getElementById('county-panel-state')!.textContent = snap.state;
    document.getElementById('county-population')!.textContent =
        snap.population.toLocaleString();
    document.getElementById('county-industry')!.textContent = snap.primaryIndustry;

    const unempBar = document.getElementById('county-unemployment-bar')!;
    const unempVal = document.getElementById('county-unemployment-val')!;
    unempBar.style.width = `${Math.min(100, snap.unemployment / 50 * 100)}%`;
    unempVal.textContent = `${snap.unemployment.toFixed(1)}%`;

    const indBar = document.getElementById('county-industrial-bar')!;
    const indVal = document.getElementById('county-industrial-val')!;
    indBar.style.width = `${snap.industrialIndex}%`;
    indVal.textContent = `${snap.industrialIndex}`;

    const badge = document.getElementById('county-distress-badge')!;
    badge.textContent = snap.distressLevel;
    badge.className = `distress-badge ${snap.distressLevel}`;
}

function toggleCountyMode(): void {
    countyModeActive = !countyModeActive;
    const btn = document.getElementById('county-mode-btn');

    if (countyModeActive) {
        btn?.classList.add('active');
        loadCountyLayers();
    } else {
        btn?.classList.remove('active');
        removeCountyLayers();
        document.getElementById('county-info-panel')?.classList.add('hidden');
    }
}

// === CONTROL PANEL LOGIC ===
let controlsInitialized = false;

function setupControls() {
    // Settings panel toggle (only bind once)
    if (!controlsInitialized) {
        const settingsBtn = document.getElementById('settings-btn');
        const controlPanel = document.getElementById('control-panel');
        const closePanel = document.getElementById('close-panel');

        settingsBtn?.addEventListener('click', () => {
            controlPanel?.classList.toggle('hidden');
        });
        closePanel?.addEventListener('click', () => {
            controlPanel?.classList.add('hidden');
        });
        controlsInitialized = true;
    }

    // Contour opacity slider
    setupSlider('contour-opacity', (val) => {
        const opacity = val / 100;
        if (map.getLayer('contours-minor-glow')) {
            map.setPaintProperty('contours-minor-glow', 'line-opacity', opacity * 0.5);
            map.setPaintProperty('contours-minor-core', 'line-opacity', opacity);
            map.setPaintProperty('contours-major-glow', 'line-opacity', opacity * 0.6);
            map.setPaintProperty('contours-major-core', 'line-opacity', opacity);
        }
    });

    // Contour width slider
    setupSlider('contour-width', (val) => {
        if (map.getLayer('contours-minor-core')) {
            map.setPaintProperty('contours-minor-core', 'line-width', val * 0.3);
            map.setPaintProperty('contours-major-core', 'line-width', val * 0.5);
            map.setPaintProperty('contours-minor-glow', 'line-width', val);
            map.setPaintProperty('contours-major-glow', 'line-width', val * 1.5);
        }
    });

    // Contour glow slider
    setupSlider('contour-glow', (val) => {
        if (map.getLayer('contours-minor-glow')) {
            map.setPaintProperty('contours-minor-glow', 'line-blur', val);
            map.setPaintProperty('contours-major-glow', 'line-blur', val * 1.5);
        }
    });

    // City opacity slider
    setupSlider('city-opacity', (val) => {
        const opacity = val / 100;
        if (map.getLayer('roads-core')) {
            map.setPaintProperty('roads-glow', 'line-opacity', opacity * 0.5);
            map.setPaintProperty('roads-core', 'line-opacity', opacity);
            map.setPaintProperty('buildings-glow', 'line-opacity', opacity * 0.6);
            map.setPaintProperty('buildings-core', 'line-opacity', opacity);
            map.setPaintProperty('urban-glow', 'line-opacity', opacity * 0.5);
            map.setPaintProperty('urban-core', 'line-opacity', opacity);
        }
    });

    // City glow slider
    setupSlider('city-glow', (val) => {
        if (map.getLayer('roads-glow')) {
            map.setPaintProperty('roads-glow', 'line-blur', val);
            map.setPaintProperty('buildings-glow', 'line-blur', val * 0.5);
            map.setPaintProperty('urban-glow', 'line-blur', val);
        }
    });

    // Layer toggles
    setupToggle('toggle-hillshade', ['hillshade']);
    setupToggle('toggle-contours', ['contours-minor-glow', 'contours-minor-core', 'contours-major-glow', 'contours-major-core']);
    setupToggle('toggle-cities', ['buildings-glow', 'buildings-core', 'urban-glow', 'urban-core']);
    setupToggle('toggle-water', ['water-glow', 'water-core']);
    setupToggle('toggle-roads', ['roads-glow', 'roads-core']);
    setupToggle('toggle-rail', ['rail-historical-glow', 'rail-historical-core']);

    // CRT Toggle (DOM element, not MapLibre layer)
    const crtCheckbox = document.getElementById('toggle-crt') as HTMLInputElement;
    crtCheckbox?.addEventListener('change', () => {
        const overlay = document.querySelector('.scanline-overlay');
        if (crtCheckbox.checked) {
            overlay?.classList.remove('hidden');
        } else {
            overlay?.classList.add('hidden');
        }
    });

    // Road Detail at Low Zoom slider
    setupSlider('road-min-zoom', (val) => {
        if (map.getLayer('roads-glow')) {
            map.setLayerZoomRange('roads-glow', val, 24);
            map.setLayerZoomRange('roads-core', val, 24);
        }
    });
}

function setupSlider(id: string, callback: (val: number) => void) {
    const slider = document.getElementById(id) as HTMLInputElement;
    const valDisplay = document.getElementById(`${id}-val`);
    if (slider) {
        slider.addEventListener('input', () => {
            const val = parseFloat(slider.value);
            if (valDisplay) {
                valDisplay.textContent = id.includes('opacity') ? `${val}%` : `${val}`;
            }
            callback(val);
        });
    }
}

function setupToggle(id: string, layerIds: string[]) {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            const visibility = checkbox.checked ? 'visible' : 'none';
            layerIds.forEach(layerId => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, 'visibility', visibility);
                }
            });
        });
    }
}

// === EVENT HANDLERS ===
map.on('load', async () => {
    console.log('Map loaded! Mode:', currentMode);

    // Load the Great Depression scenario
    try {
        await loadGreatDepressionScenario();

        // Wire timeline bounds into FlightDeck for progress bar
        const scenario = timelineEngine.getScenario();
        if (scenario?.endDate) {
            flightDeck.setTimelineBounds(scenario.startDate, scenario.endDate);
        }

        updateDateDisplay();
        console.log('[Timeline] Scenario loaded, date controls active');
    } catch (error) {
        console.error('[Timeline] Failed to load scenario:', error);
    }

    document.getElementById('toggle-btn')?.addEventListener('click', toggleMode);
    document.getElementById('county-mode-btn')?.addEventListener('click', toggleCountyMode);

    // Time control buttons
    document.getElementById('play-btn')?.addEventListener('click', toggleAutoPlay);
    document.getElementById('time-day')?.addEventListener('click', () => advanceTime('day'));
    document.getElementById('time-week')?.addEventListener('click', () => advanceTime('week'));
    document.getElementById('time-month')?.addEventListener('click', () => advanceTime('month'));
    document.getElementById('time-year')?.addEventListener('click', () => advanceTime('year'));

    // Market Theater Toggles
    document.getElementById('expand-market-btn')?.addEventListener('click', () => {
        flightDeck.toggleMarketTheater(true);
    });
    document.getElementById('close-market-btn')?.addEventListener('click', () => {
        flightDeck.toggleMarketTheater(false);
    });


    const updateAltitude = () => {
        const zoom = map.getZoom();
        flightDeck.updateAltitude(zoom);
    };

    map.on('zoom', updateAltitude);
    updateAltitude();

    setupControls();
});

map.on('style.load', () => {
    console.log('Style loaded! Mode:', currentMode);
    // Re-setup controls when style changes
    setTimeout(setupControls, 100);
    // Re-load county layers if they were active
    if (countyModeActive) {
        countyLayersLoaded = false;
        setTimeout(loadCountyLayers, 200);
    }
});

map.on('error', (e) => console.error('MapLibre error:', e));

// === KEYBOARD SHORTCUTS ===
document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    switch (e.code) {
        // View controls
        case 'KeyM':
            toggleMode();
            break;
        case 'KeyC':
            toggleCountyMode();
            break;
        case 'KeyF':
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
            break;
        case 'KeyS':
            document.getElementById('control-panel')?.classList.toggle('hidden');
            break;
        case 'KeyK': {
            const theater = document.getElementById('market-operations-theater');
            const isHidden = theater?.classList.contains('hidden');
            flightDeck.toggleMarketTheater(!!isHidden);
            break;
        }

        // Zoom controls
        case 'Equal': // + key
        case 'NumpadAdd':
            map.zoomIn();
            break;
        case 'Minus':
        case 'NumpadSubtract':
            map.zoomOut();
            break;

        // Time controls
        case 'Space':
            e.preventDefault();
            toggleAutoPlay();
            break;
        case 'ArrowRight':
            advanceTime('day');
            break;
        case 'ArrowLeft':
            console.log('[Keyboard] Rewind not implemented yet');
            break;
        case 'ArrowUp':
            advanceTime('month');
            break;
        case 'ArrowDown':
            advanceTime('week');
            break;
    }
});

console.log('[Keyboard] Shortcuts: M=mode, C=county, F=fullscreen, S=settings, K=market, +/-=zoom, Arrows=time');
