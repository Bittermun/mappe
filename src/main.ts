import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// @ts-ignore
import mlcontour from 'maplibre-contour';

// === DEM SOURCE FOR CONTOURS ===
const demSource = new mlcontour.DemSource({
    url: 'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png',
    encoding: 'terrarium',
    maxzoom: 13,
});
demSource.setupMaplibre(maplibregl);

let currentMode: 'satellite' | 'contour' = 'satellite';

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
function setupControls() {
    // Settings panel toggle
    const settingsBtn = document.getElementById('settings-btn');
    const controlPanel = document.getElementById('control-panel');
    const closePanel = document.getElementById('close-panel');

    settingsBtn?.addEventListener('click', () => {
        controlPanel?.classList.toggle('hidden');
    });
    closePanel?.addEventListener('click', () => {
        controlPanel?.classList.add('hidden');
    });

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
    setupToggle('toggle-water', ['water-glow', 'water-core']);
    setupToggle('toggle-roads', ['roads-glow', 'roads-core']);
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
    console.log('Map loaded! Mode:', currentMode);
    
    document.getElementById('toggle-btn')?.addEventListener('click', toggleMode);
    
    const updateZoom = () => {
        const zoomEl = document.getElementById('zoom-val');
        if (zoomEl) zoomEl.textContent = map.getZoom().toFixed(1);
    };
    map.on('zoom', updateZoom);
    updateZoom();

    setupControls();
});

map.on('style.load', () => {
    console.log('Style loaded! Mode:', currentMode);
    // Re-setup controls when style changes
    setTimeout(setupControls, 100);
});

map.on('error', (e) => console.error('MapLibre error:', e));
