import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// @ts-ignore
import mlcontour from 'maplibre-contour';

// === DEM SOURCE FOR CONTOURS ===
const demSource = new mlcontour.DemSource({
    url: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    encoding: 'terrarium',
    maxzoom: 12,
    // Reduce worker count to avoid overwhelming network
    worker: true,
});
demSource.setupMaplibre(maplibregl);

let currentMode: 'satellite' | 'contour' = 'satellite';

// === STATE MANAGEMENT ===
const controlState = {
    contourOpacity: 60,
    contourGlow: 2,
    contourDistance: 0,
    cityOpacity: 80,
    cityGlow: 4,
    cityDistance: 0,
    roadsDistance: 0,
    railDistance: 0,
    ferryDistance: 0,
    detailBoost: 1,
    crtIntensity: 25,
    glowStyle: 'soft' as 'soft' | 'neon' | 'hard' | 'subtle' | 'none',
    layers: {
        contours: true,
        cities: true,
        water: true,
        roads: true,
        rail: true,
        ferry: true,
        borders: true
    },
    logOpen: false
};

// === DEBUG LOG HELPER ===
function debugLog(msg: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') {
    const logContent = document.getElementById('log-content');
    if (!logContent) return;

    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.textContent = `[${time}] ${msg}`;

    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;

    while (logContent.children.length > 100) {
        logContent.removeChild(logContent.firstChild!);
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
            maxzoom: 12,
            tileSize: 256,
        },
        contours: {
            type: 'vector',
            tiles: [
                demSource.contourProtocolUrl({
                    multiplier: 1,
                    // Simplified thresholds - less aggressive
                    thresholds: {
                        8: [500],
                        10: [100, 500],
                        12: [50, 200],
                    },
                    elevationKey: 'ele',
                    levelKey: 'level',
                    contourLayer: 'contours',
                }),
            ],
            maxzoom: 14,
        },
        openfree: {
            type: 'vector',
            tiles: ['https://tiles.openfreemap.org/planet/latest/{z}/{x}/{y}.pbf'],
            minzoom: 0,
            maxzoom: 14
        }
    },
    layers: [
        // === BACKGROUND ===
        { id: 'background', type: 'background', paint: { 'background-color': '#000000' } },

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

        // === WATER (FILLED BLUE AREA + COASTLINE GLOW) ===
        {
            id: 'water-fill',
            type: 'fill',
            source: 'openfree',
            'source-layer': 'water',
            paint: {
                'fill-color': '#001133',
                'fill-opacity': 0.9
            }
        },
        {
            id: 'water-glow',
            type: 'line',
            source: 'openfree',
            'source-layer': 'water',
            paint: {
                'line-color': '#0066bb',
                'line-width': 3,
                'line-blur': 3,
                'line-opacity': 0.6
            }
        },
        {
            id: 'water-core',
            type: 'line',
            source: 'openfree',
            'source-layer': 'water',
            paint: {
                'line-color': '#00aaff',
                'line-width': 1,
                'line-opacity': 0.9
            }
        },

        // === ROADS (ORANGE GLOW) ===
        {
            id: 'roads-glow',
            type: 'line',
            source: 'openfree',
            'source-layer': 'transportation',
            minzoom: 10,
            paint: {
                'line-color': '#663300',
                'line-width': 4,
                'line-blur': 3,
                'line-opacity': 0.4
            }
        },
        {
            id: 'roads-core',
            type: 'line',
            source: 'openfree',
            'source-layer': 'transportation',
            minzoom: 10,
            paint: {
                'line-color': '#ff8800',
                'line-width': 1,
                'line-opacity': 0.8
            }
        },

        // === RAIL (MAGENTA GLOW) ===
        {
            id: 'rail-glow',
            type: 'line',
            source: 'openfree',
            'source-layer': 'transportation',
            filter: ['in', ['get', 'class'], ['literal', ['rail', 'light_rail', 'subway', 'tram']]],
            minzoom: 8,
            paint: {
                'line-color': '#440066',
                'line-width': 3,
                'line-blur': 2,
                'line-opacity': 0.5
            }
        },
        {
            id: 'rail-core',
            type: 'line',
            source: 'openfree',
            'source-layer': 'transportation',
            filter: ['in', ['get', 'class'], ['literal', ['rail', 'light_rail', 'subway', 'tram']]],
            minzoom: 8,
            paint: {
                'line-color': '#ff00ff',
                'line-width': 1.2,
                'line-opacity': 0.9
            }
        },
        {
            id: 'rail-ticks',
            type: 'line',
            source: 'openfree',
            'source-layer': 'transportation',
            filter: ['in', ['get', 'class'], ['literal', ['rail', 'light_rail', 'subway', 'tram']]],
            minzoom: 8,
            paint: {
                'line-color': '#ffffff',
                'line-width': 0.8,
                'line-opacity': 0.4,
                'line-dasharray': [1, 3]
            }
        },

        // === FERRY (CYAN DASHED) ===
        {
            id: 'ferry-glow',
            type: 'line',
            source: 'openfree',
            'source-layer': 'transportation',
            filter: ['==', ['get', 'class'], 'ferry'],
            minzoom: 6,
            paint: {
                'line-color': '#004444',
                'line-width': 2,
                'line-blur': 2,
                'line-opacity': 0.4,
                'line-dasharray': [4, 4]
            }
        },
        {
            id: 'ferry-core',
            type: 'line',
            source: 'openfree',
            'source-layer': 'transportation',
            filter: ['==', ['get', 'class'], 'ferry'],
            minzoom: 6,
            paint: {
                'line-color': '#00cccc',
                'line-width': 1,
                'line-opacity': 0.7,
                'line-dasharray': [4, 4]
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

        // === BORDERS (RED/ORANGE DASHED) ===
        {
            id: 'borders-glow',
            type: 'line',
            source: 'openfree',
            'source-layer': 'boundary',
            filter: ['in', ['get', 'admin_level'], ['literal', [2, 4]]],
            paint: {
                'line-color': '#442200',
                'line-width': 2,
                'line-blur': 2,
                'line-opacity': 0.5
            }
        },
        {
            id: 'borders-core',
            type: 'line',
            source: 'openfree',
            'source-layer': 'boundary',
            filter: ['in', ['get', 'admin_level'], ['literal', [2, 4]]],
            paint: {
                'line-color': '#ff6600',
                'line-width': 1,
                'line-opacity': 0.8,
                'line-dasharray': [6, 4]
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
    center: [7.01, 51.45],
    zoom: 11,
    pitch: 60,
    bearing: 45,
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
    const modeEl = document.getElementById('mode-val');
    if (modeEl) modeEl.textContent = currentMode.toUpperCase();
}

// === CONTROL PANEL LOGIC ===
// Settings panel toggle - runs once on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const controlPanel = document.getElementById('control-panel');
    const closePanel = document.getElementById('close-panel');

    settingsBtn?.addEventListener('click', () => {
        controlPanel?.classList.toggle('hidden');
    });
    closePanel?.addEventListener('click', () => {
        controlPanel?.classList.add('hidden');
    });
});

function setupControls() {
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
    setupToggle('toggle-contours', ['contours-minor-glow', 'contours-minor-core', 'contours-major-glow', 'contours-major-core']);
    setupToggle('toggle-cities', ['buildings-glow', 'buildings-core', 'urban-glow', 'urban-core']);
    setupToggle('toggle-water', ['water-fill', 'water-glow', 'water-core']);
    setupToggle('toggle-roads', ['roads-glow', 'roads-core']);
    setupToggle('toggle-rail', ['rail-glow', 'rail-core', 'rail-ticks']);
    setupToggle('toggle-ferry', ['ferry-glow', 'ferry-core']);
    setupToggle('toggle-borders', ['borders-glow', 'borders-core']);

    // Glow style dropdown
    const glowStyleSelect = document.getElementById('glow-style') as HTMLSelectElement;
    if (glowStyleSelect) {
        glowStyleSelect.addEventListener('change', () => {
            controlState.glowStyle = glowStyleSelect.value as typeof controlState.glowStyle;
            applyGlowStyle();
        });
    }
}

// === GLOW STYLE SYSTEM ===
function applyGlowStyle() {
    if (currentMode !== 'contour' || !map.isStyleLoaded()) return;

    const cityGlow = controlState.cityGlow;
    const glowStyle = controlState.glowStyle;

    const glowConfigs = {
        soft: { blurMult: 1.0, widthMult: 1.0, opacityMult: 1.0 },
        neon: { blurMult: 0.5, widthMult: 1.8, opacityMult: 1.2 },
        hard: { blurMult: 0.1, widthMult: 0.8, opacityMult: 1.0 },
        subtle: { blurMult: 1.5, widthMult: 0.6, opacityMult: 0.5 },
        none: { blurMult: 0, widthMult: 0, opacityMult: 0 }
    };
    const gc = glowConfigs[glowStyle];

    if (map.getLayer('roads-glow')) {
        map.setPaintProperty('roads-glow', 'line-blur', cityGlow * gc.blurMult);
        map.setPaintProperty('roads-glow', 'line-width', (2 + cityGlow * 0.5) * gc.widthMult);
        map.setPaintProperty('roads-glow', 'line-opacity', 0.4 * gc.opacityMult);
    }
    if (map.getLayer('buildings-glow')) {
        map.setPaintProperty('buildings-glow', 'line-blur', cityGlow * 0.8 * gc.blurMult);
        map.setPaintProperty('buildings-glow', 'line-width', (2 + cityGlow * 0.3) * gc.widthMult);
        map.setPaintProperty('buildings-glow', 'line-opacity', 0.6 * gc.opacityMult);
    }
    if (map.getLayer('urban-glow')) {
        map.setPaintProperty('urban-glow', 'line-blur', cityGlow * gc.blurMult);
        map.setPaintProperty('urban-glow', 'line-width', (2 + cityGlow * 0.5) * gc.widthMult);
        map.setPaintProperty('urban-glow', 'line-opacity', 0.5 * gc.opacityMult);
    }
    if (map.getLayer('rail-glow')) {
        map.setPaintProperty('rail-glow', 'line-blur', cityGlow * 0.7 * gc.blurMult);
        map.setPaintProperty('rail-glow', 'line-width', (2 + cityGlow * 0.4) * gc.widthMult);
        map.setPaintProperty('rail-glow', 'line-opacity', 0.5 * gc.opacityMult);
    }
    if (map.getLayer('ferry-glow')) {
        map.setPaintProperty('ferry-glow', 'line-blur', cityGlow * 0.5 * gc.blurMult);
        map.setPaintProperty('ferry-glow', 'line-opacity', 0.4 * gc.opacityMult);
    }
    if (map.getLayer('water-glow')) {
        map.setPaintProperty('water-glow', 'line-blur', 4 * gc.blurMult);
        map.setPaintProperty('water-glow', 'line-width', 5 * gc.widthMult);
        map.setPaintProperty('water-glow', 'line-opacity', 0.5 * gc.opacityMult);
    }
    if (map.getLayer('contours-minor-glow')) {
        map.setPaintProperty('contours-minor-glow', 'line-blur', controlState.contourGlow * gc.blurMult);
        map.setPaintProperty('contours-minor-glow', 'line-width', 2 * gc.widthMult);
        map.setPaintProperty('contours-major-glow', 'line-blur', controlState.contourGlow * 1.5 * gc.blurMult);
        map.setPaintProperty('contours-major-glow', 'line-width', 4 * gc.widthMult);
    }
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
map.on('load', () => {
    debugLog('Map loaded', 'success');

    document.getElementById('toggle-btn')?.addEventListener('click', () => {
        debugLog('Mode toggle requested');
        toggleMode();
    });

    // Log toggle button
    document.getElementById('log-toggle-btn')?.addEventListener('click', () => {
        controlState.logOpen = !controlState.logOpen;
        document.getElementById('debug-log')?.classList.toggle('hidden', !controlState.logOpen);
        debugLog(controlState.logOpen ? 'Log opened' : 'Log closed');
    });

    const updateZoom = () => {
        const zoom = map.getZoom();
        const zoomEl = document.getElementById('zoom-val');
        if (zoomEl) zoomEl.textContent = zoom.toFixed(1);

        const statsEl = document.getElementById('log-stats');
        if (statsEl) statsEl.textContent = `Z: ${zoom.toFixed(1)}`;
    };
    map.on('zoom', updateZoom);
    updateZoom();

    setupControls();
});

map.on('style.load', () => {
    debugLog(`Style loaded: ${currentMode}`, 'success');
    setTimeout(setupControls, 100);
    applyGlowStyle();
});

map.on('error', (e) => {
    console.error('MapLibre error:', e);
    debugLog(`MAP ERROR: ${e.error?.message || 'Unknown'}`, 'error');
});

map.on('dataloading', (e: any) => {
    if (e.dataType === 'source') {
        debugLog(`Loading: ${e.sourceId}`);
    }
});
