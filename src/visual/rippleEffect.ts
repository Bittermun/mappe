/**
 * Ripple Effect for Crash Events
 * 
 * Creates visual ripple emanating from event locations
 */

import type maplibregl from 'maplibre-gl';

interface RippleConfig {
    center: [number, number];
    color: string;
    maxRadius: number;
    durationMs: number;
}

let rippleLayerId = 0;

/**
 * Create a pulsing ripple effect at the given coordinates
 */
export function createRipple(
    map: maplibregl.Map,
    config: RippleConfig
): void {
    const id = `ripple-${rippleLayerId++}`;
    const startTime = Date.now();

    // Create a temporary source for this ripple
    map.addSource(id, {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: config.center
                },
                properties: {}
            }]
        }
    });

    // Add the ripple layer
    map.addLayer({
        id: id,
        type: 'circle',
        source: id,
        paint: {
            'circle-color': config.color,
            'circle-radius': 0,
            'circle-opacity': 0.8,
            'circle-stroke-color': config.color,
            'circle-stroke-width': 3,
            'circle-stroke-opacity': 1
        }
    });

    // Animate the ripple
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / config.durationMs, 1);

        // Ease-out exponential
        const t = 1 - Math.pow(1 - progress, 3);

        const radius = config.maxRadius * t;
        const opacity = 0.8 * (1 - progress);

        if (map.getLayer(id)) {
            map.setPaintProperty(id, 'circle-radius', radius);
            map.setPaintProperty(id, 'circle-opacity', opacity * 0.3);
            map.setPaintProperty(id, 'circle-stroke-opacity', opacity);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Clean up
            if (map.getLayer(id)) map.removeLayer(id);
            if (map.getSource(id)) map.removeSource(id);
        }
    }

    requestAnimationFrame(animate);
}

/**
 * Create the iconic Black Tuesday ripple from Wall Street
 */
export function createBlackTuesdayRipple(map: maplibregl.Map): void {
    // Wall Street coordinates
    const wallStreet: [number, number] = [-74.006, 40.7128];

    // Create multiple expanding waves
    createRipple(map, {
        center: wallStreet,
        color: '#ff0000',
        maxRadius: 50,
        durationMs: 2000
    });

    // Second wave delayed
    setTimeout(() => {
        createRipple(map, {
            center: wallStreet,
            color: '#ff4400',
            maxRadius: 80,
            durationMs: 3000
        });
    }, 500);

    // Third larger wave
    setTimeout(() => {
        createRipple(map, {
            center: wallStreet,
            color: '#ff6600',
            maxRadius: 120,
            durationMs: 4000
        });
    }, 1000);
}

/**
 * Create a bank failure pulse at a city location
 */
export function createBankFailurePulse(
    map: maplibregl.Map,
    coordinates: [number, number],
    cityName: string
): void {
    console.log('[Ripple] Bank failure at:', cityName);

    // Red pulse for bank failure
    createRipple(map, {
        center: coordinates,
        color: '#ff2222',
        maxRadius: 30,
        durationMs: 1500
    });
}
