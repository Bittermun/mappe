/**
 * Scenario Loader
 * 
 * Loads scenario data from JSON files and GeoJSON boundaries.
 */

import type { Scenario, NationState, TimelineEvent } from './types';
import { timelineEngine } from './timeline';

export async function loadGreatDepressionScenario(): Promise<void> {
    try {
        // Load nations data
        const nationsResponse = await fetch('/data/scenarios/great-depression/nations.json');
        const nationsData = await nationsResponse.json();

        // Load events data
        const eventsResponse = await fetch('/data/scenarios/great-depression/events.json');
        const eventsData = await eventsResponse.json();

        // Parse nations
        const initialNations: NationState[] = nationsData.nations.map((n: any) => ({
            ...n,
            relations: new Map()
        }));

        // Parse events with proper date objects
        const seedEvents: TimelineEvent[] = eventsData.events.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp)
        }));

        // Create scenario object
        const scenario: Scenario = {
            id: nationsData.id,
            name: nationsData.name,
            description: nationsData.description,
            startDate: new Date(nationsData.startDate),
            focusRegion: nationsData.focusRegion,
            initialNations,
            seedEvents,
            boundariesGeoJSON: '/data/scenarios/great-depression/world_1920.geojson'
        };

        // Load into engine
        await timelineEngine.loadScenario(scenario);

        console.log('[ScenarioLoader] Great Depression scenario loaded');

    } catch (error) {
        console.error('[ScenarioLoader] Failed to load scenario:', error);
        throw error;
    }
}

export async function loadBoundariesGeoJSON(): Promise<any> {
    const response = await fetch('/data/scenarios/great-depression/world_1920.geojson');
    return response.json();
}
