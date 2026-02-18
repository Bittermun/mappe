/**
 * Tactical Ripple Effect (Premium Edition)
 * 
 * Creates geographically-anchored concentric pulses with bloom and decay.
 * Designed for the "Tactical Command Terminal" aesthetic.
 */

import type maplibregl from 'maplibre-gl';

interface RippleConfig {
    center: [number, number];
    color: string;
    maxRadius: number;
    durationMs: number;
    ringCount?: number;
}

let rippleLayerId = 0;

/**
 * Create a single expanding tactical ring
 */
function createPremiumRing(
    map: maplibregl.Map,
    config: RippleConfig,
    delayMs: number,
    ringIndex: number
): void {
    const id = `ripple-p-${rippleLayerId++}-${ringIndex}`;

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

    // Layer 1: The Glow Bloom (Blurred Circle)
    const glowId = `${id}-glow`;
    map.addLayer({
        id: glowId,
        type: 'circle',
        source: id,
        paint: {
            'circle-radius': 0,
            'circle-color': config.color,
            'circle-opacity': 0,
            'circle-blur': 1, // Corrected: blurred circle instead of stroke blur
        }
    });

    // Layer 2: The Core Ring (Sharp Stroke)
    const coreId = `${id}-core`;
    map.addLayer({
        id: coreId,
        type: 'circle',
        source: id,
        paint: {
            'circle-radius': 0,
            'circle-opacity': 0,
            'circle-stroke-color': '#ffffff', // Flash white core
            'circle-stroke-width': 2,
            'circle-stroke-opacity': 0
        }
    });

    const startTime = Date.now() + delayMs;

    function animate() {
        const now = Date.now();
        if (now < startTime) {
            requestAnimationFrame(animate);
            return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(elapsed / config.durationMs, 1);

        // Quintic ease-out for a "shockwave" feel: very fast start, slow finish
        const t = 1 - Math.pow(1 - progress, 5);
        const radius = config.maxRadius * t;

        // Opacity Logic: Sharp flash -> Phosphor decay
        let opacity = 0;
        if (progress < 0.1) {
            opacity = progress * 10; // Rapid flash
        } else {
            opacity = 1 - Math.pow((progress - 0.1) / 0.9, 2); // Quadratic decay
        }

        if (map.getLayer(coreId)) {
            map.setPaintProperty(coreId, 'circle-radius', radius);
            map.setPaintProperty(coreId, 'circle-stroke-opacity', opacity * 0.9);
            map.setPaintProperty(coreId, 'circle-stroke-color', progress < 0.3 ? '#ffffff' : config.color);
            map.setPaintProperty(coreId, 'circle-stroke-width', 2 * (1 - progress));
        }

        if (map.getLayer(glowId)) {
            map.setPaintProperty(glowId, 'circle-radius', radius * 1.1); // Slightly larger glow
            map.setPaintProperty(glowId, 'circle-opacity', opacity * 0.3);
            map.setPaintProperty(glowId, 'circle-blur', 1.5 * progress);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Cleanup
            [coreId, glowId].forEach(l => { if (map.getLayer(l)) map.removeLayer(l); });
            if (map.getSource(id)) map.removeSource(id);
        }
    }

    requestAnimationFrame(animate);
}

/**
 * Create a premium multi-ring radar pulse
 */
export function createTacticalRipple(
    map: maplibregl.Map,
    config: RippleConfig
): void {
    const ringCount = config.ringCount || 3;
    const interval = 300; // Delay between rings

    for (let i = 0; i < ringCount; i++) {
        // Rings get progressively larger and slower
        createPremiumRing(map, {
            ...config,
            maxRadius: config.maxRadius * (1 + i * 0.2),
            durationMs: config.durationMs + (i * 500)
        }, i * interval, i);
    }
}

/**
 * Convenience for Black Tuesday (Sublime Cinematic Pulse)
 */
export function triggerBlackTuesdayRipple(map: maplibregl.Map): void {
    createTacticalRipple(map, {
        center: [-74.006, 40.7128],
        color: '#00ffff',
        maxRadius: 180,
        durationMs: 2500,
        ringCount: 4
    });
}
