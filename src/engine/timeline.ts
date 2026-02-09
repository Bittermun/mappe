/**
 * Timeline Engine - Core
 * 
 * Manages the world state, event processing, and time advancement.
 */

import type {
    WorldState,
    TimelineEvent,
    NationState,
    Scenario,
    TimeState,
    TimeSpeed,
    EventFilter
} from './types';

// === TIMELINE ENGINE CLASS ===

export class TimelineEngine {
    private worldState: WorldState;
    private timeState: TimeState;
    private scenario: Scenario | null = null;
    private eventListeners: Map<string, ((event: TimelineEvent) => void)[]> = new Map();

    constructor() {
        this.worldState = {
            date: new Date(),
            nations: new Map(),
            activeEvents: [],
            projectedEvents: [],
            historicalEvents: []
        };
        this.timeState = {
            currentDate: new Date(),
            speed: 'paused',
            isPaused: true
        };
    }

    // === SCENARIO LOADING ===

    async loadScenario(scenario: Scenario): Promise<void> {
        this.scenario = scenario;

        // Set initial date
        this.worldState.date = new Date(scenario.startDate);
        this.timeState.currentDate = new Date(scenario.startDate);

        // Load nations
        this.worldState.nations.clear();
        for (const nation of scenario.initialNations) {
            this.worldState.nations.set(nation.id, nation);
        }

        // Load seed events
        this.worldState.historicalEvents = [];
        this.worldState.activeEvents = [];

        for (const event of scenario.seedEvents) {
            const eventDate = new Date(event.timestamp);
            if (eventDate <= this.worldState.date) {
                this.worldState.historicalEvents.push(event);
            } else {
                // Future events are "projected" until they occur
                this.worldState.projectedEvents.push(event);
            }
        }

        console.log(`[TimelineEngine] Loaded scenario: ${scenario.name}`);
        console.log(`[TimelineEngine] Nations: ${this.worldState.nations.size}`);
        console.log(`[TimelineEngine] Seed events: ${scenario.seedEvents.length}`);
    }

    // === TIME CONTROL ===

    setSpeed(speed: TimeSpeed): void {
        this.timeState.speed = speed;
        this.timeState.isPaused = speed === 'paused';
    }

    getTimeState(): TimeState {
        return { ...this.timeState };
    }

    advanceTime(amount: 'day' | 'week' | 'month' | 'year' = 'day'): TimelineEvent[] {
        const currentDate = new Date(this.worldState.date);
        const triggeredEvents: TimelineEvent[] = [];

        // Calculate new date
        switch (amount) {
            case 'day':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'week':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'month':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            case 'year':
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                break;
        }

        // Check for events that should trigger
        const eventsToTrigger = this.worldState.projectedEvents.filter(
            event => new Date(event.timestamp) <= currentDate
        );

        for (const event of eventsToTrigger) {
            // Move from projected to historical
            const index = this.worldState.projectedEvents.indexOf(event);
            if (index > -1) {
                this.worldState.projectedEvents.splice(index, 1);
            }
            this.worldState.historicalEvents.push(event);
            this.worldState.activeEvents.push(event);
            triggeredEvents.push(event);

            // Notify listeners
            this.emitEvent('eventTriggered', event);

            // Apply event effects to nations
            this.applyEventEffects(event);
        }

        // Update world date
        this.worldState.date = currentDate;
        this.timeState.currentDate = currentDate;

        return triggeredEvents;
    }

    // === EVENT HANDLING ===

    private applyEventEffects(event: TimelineEvent): void {
        // Apply economic/stability changes based on event type and scope
        const impactMultiplier = event.scope === 'global' ? 1.5 :
            event.scope === 'regional' ? 1.2 : 1.0;

        for (const nationId of event.nations) {
            const nation = this.worldState.nations.get(nationId);
            if (!nation) continue;

            switch (event.type) {
                case 'economic':
                    // Economic events affect economic health
                    if (event.tags?.includes('crash') || event.tags?.includes('bank-failure')) {
                        nation.economicHealth = Math.max(0, nation.economicHealth - 15 * impactMultiplier);
                        nation.stability = Math.max(0, nation.stability - 5 * impactMultiplier);
                    } else if (event.tags?.includes('recovery') || event.tags?.includes('hope')) {
                        nation.economicHealth = Math.min(100, nation.economicHealth + 10);
                        nation.stability = Math.min(100, nation.stability + 5);
                    }
                    break;

                case 'political':
                    // Political events primarily affect stability
                    if (event.tags?.includes('upheaval') || event.tags?.includes('fascism')) {
                        nation.stability = Math.max(0, nation.stability - 20 * impactMultiplier);
                    }
                    break;
            }
        }
    }

    // === QUERIES ===

    getWorldState(): WorldState {
        return this.worldState;
    }

    getCurrentDate(): Date {
        return new Date(this.worldState.date);
    }

    getScenario(): Scenario | null {
        return this.scenario;
    }

    getNation(id: string): NationState | undefined {
        return this.worldState.nations.get(id);
    }

    getEvents(filter?: EventFilter): TimelineEvent[] {
        let events = [...this.worldState.historicalEvents];

        if (!filter) return events;

        if (filter.types) {
            events = events.filter(e => filter.types!.includes(e.type));
        }
        if (filter.scopes) {
            events = events.filter(e => filter.scopes!.includes(e.scope));
        }
        if (filter.nations) {
            events = events.filter(e =>
                e.nations.some(n => filter.nations!.includes(n))
            );
        }
        if (filter.startDate) {
            events = events.filter(e => new Date(e.timestamp) >= filter.startDate!);
        }
        if (filter.endDate) {
            events = events.filter(e => new Date(e.timestamp) <= filter.endDate!);
        }

        return events;
    }

    getActiveEvents(): TimelineEvent[] {
        return [...this.worldState.activeEvents];
    }

    clearActiveEvents(): void {
        this.worldState.activeEvents = [];
    }

    // === EVENT LISTENERS ===

    on(eventType: string, callback: (event: TimelineEvent) => void): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)!.push(callback);
    }

    private emitEvent(eventType: string, event: TimelineEvent): void {
        const listeners = this.eventListeners.get(eventType) || [];
        listeners.forEach(callback => callback(event));
    }
}

// === SINGLETON INSTANCE ===
export const timelineEngine = new TimelineEngine();
