/**
 * Visual State Manager for Great Depression Visualization
 * 
 * Controls the color palette, glow intensity, and route opacity
 * based on the current timeline position and triggered events.
 */

import type maplibregl from 'maplibre-gl';

export type VisualAct = 'prosperity' | 'collapse' | 'stillness';

export interface VisualState {
    act: VisualAct;
    colorTemp: number;        // 0 = cold blue, 100 = warm amber
    cityBrightness: number;   // 0-100
    routeActivity: number;    // 0-100
    routeIntegrity: number;   // 0-100 (100 = all routes intact)
}

// Warm palette (prosperity)
const WARM = {
    cityCore: '#ffcc00',
    cityGlow: '#ff8800',
    routeCore: '#ffcc00',
    routeGlow: '#ff8800',
    label: '#ffcc00'
};

// Cold palette (collapse/stillness)
const COLD = {
    cityCore: '#6688aa',
    cityGlow: '#334466',
    routeCore: '#556677',
    routeGlow: '#223344',
    label: '#8899aa'
};

let currentState: VisualState = {
    act: 'prosperity',
    colorTemp: 100,
    cityBrightness: 100,
    routeActivity: 100,
    routeIntegrity: 100
};

export function getCurrentVisualState(): VisualState {
    return { ...currentState };
}

export function setVisualState(state: Partial<VisualState>): void {
    currentState = { ...currentState, ...state };
}

/**
 * Interpolate between warm and cold colors based on color temperature
 */
function lerpColor(warm: string, cold: string, temp: number): string {
    const t = temp / 100;

    // Parse hex colors
    const w = hexToRgb(warm);
    const c = hexToRgb(cold);

    // Lerp each component
    const r = Math.round(c.r + (w.r - c.r) * t);
    const g = Math.round(c.g + (w.g - c.g) * t);
    const b = Math.round(c.b + (w.b - c.b) * t);

    return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * Apply current visual state to map layers
 */
export function applyVisualState(map: maplibregl.Map): void {
    const state = currentState;

    // Calculate colors
    const cityCore = lerpColor(WARM.cityCore, COLD.cityCore, state.colorTemp);
    const cityGlow = lerpColor(WARM.cityGlow, COLD.cityGlow, state.colorTemp);
    const routeCore = lerpColor(WARM.routeCore, COLD.routeCore, state.colorTemp);
    const routeGlow = lerpColor(WARM.routeGlow, COLD.routeGlow, state.colorTemp);
    const labelColor = lerpColor(WARM.label, COLD.label, state.colorTemp);

    // Apply to city layers
    if (map.getLayer('city-core')) {
        map.setPaintProperty('city-core', 'circle-color', cityCore);
        map.setPaintProperty('city-core', 'circle-opacity', state.cityBrightness / 100);
    }
    if (map.getLayer('city-outer-glow')) {
        map.setPaintProperty('city-outer-glow', 'circle-color', cityGlow);
        map.setPaintProperty('city-outer-glow', 'circle-opacity', (state.cityBrightness / 100) * 0.4);
    }

    // Apply to route layers
    if (map.getLayer('route-core')) {
        map.setPaintProperty('route-core', 'line-color', routeCore);
        map.setPaintProperty('route-core', 'line-opacity', (state.routeActivity / 100) * 0.8);
    }
    if (map.getLayer('route-glow')) {
        map.setPaintProperty('route-glow', 'line-color', routeGlow);
        map.setPaintProperty('route-glow', 'line-opacity', (state.routeActivity / 100) * 0.3);
    }

    // Apply to labels
    if (map.getLayer('city-labels')) {
        map.setPaintProperty('city-labels', 'text-color', labelColor);
    }
}

/**
 * Transition to a specific visual act
 */
export function transitionToAct(act: VisualAct, map: maplibregl.Map): void {
    switch (act) {
        case 'prosperity':
            currentState = {
                act: 'prosperity',
                colorTemp: 100,
                cityBrightness: 100,
                routeActivity: 100,
                routeIntegrity: 100
            };
            break;
        case 'collapse':
            currentState = {
                act: 'collapse',
                colorTemp: 30,
                cityBrightness: 60,
                routeActivity: 40,
                routeIntegrity: 50
            };
            break;
        case 'stillness':
            currentState = {
                act: 'stillness',
                colorTemp: 0,
                cityBrightness: 25,
                routeActivity: 5,
                routeIntegrity: 10
            };
            break;
    }

    applyVisualState(map);
    console.log('[Visual] Transitioned to:', act);
}

/**
 * Smoothly animate toward target state
 */
export function animateToState(
    target: Partial<VisualState>,
    map: maplibregl.Map,
    durationMs: number = 1000
): void {
    const start = { ...currentState };
    const startTime = Date.now();

    function step() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        // Ease-out cubic
        const t = 1 - Math.pow(1 - progress, 3);

        // Interpolate all numeric fields
        if (target.colorTemp !== undefined) {
            currentState.colorTemp = start.colorTemp + (target.colorTemp - start.colorTemp) * t;
        }
        if (target.cityBrightness !== undefined) {
            currentState.cityBrightness = start.cityBrightness + (target.cityBrightness - start.cityBrightness) * t;
        }
        if (target.routeActivity !== undefined) {
            currentState.routeActivity = start.routeActivity + (target.routeActivity - start.routeActivity) * t;
        }
        if (target.routeIntegrity !== undefined) {
            currentState.routeIntegrity = start.routeIntegrity + (target.routeIntegrity - start.routeIntegrity) * t;
        }

        applyVisualState(map);

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}
