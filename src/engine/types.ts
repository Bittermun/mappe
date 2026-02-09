/**
 * Timeline Engine - Core Types
 * 
 * Defines the data structures for the AI-driven historical simulation.
 */

// === EVENT TYPES ===

export type EventType = 'economic' | 'political' | 'military' | 'social' | 'technological';
export type EventScope = 'local' | 'national' | 'regional' | 'global';

export interface TimelineEvent {
    id: string;
    timestamp: Date;
    type: EventType;
    scope: EventScope;
    title: string;
    description: string;
    location?: {
        coordinates: [number, number]; // [lng, lat]
        name?: string;
    };
    nations: string[];           // ISO codes of affected nations
    causes: string[];            // IDs of events that caused this
    effects: string[];           // IDs of events this causes
    probability?: number;        // 0-1 for projected future events
    aiGenerated: boolean;
    tags?: string[];
}

// === NATION STATE ===

export interface NationState {
    id: string;                  // ISO-like code
    name: string;
    capital: string;
    population: number;
    gdp?: number;                // In 1929 USD for comparison
    government: GovernmentType;
    leader?: Leader;
    stability: number;           // 0-100
    economicHealth: number;      // 0-100
    relations: Map<string, Relation>;
}

export type GovernmentType =
    | 'democracy'
    | 'republic'
    | 'monarchy'
    | 'constitutional_monarchy'
    | 'dictatorship'
    | 'communist'
    | 'fascist'
    | 'colonial';

export interface Leader {
    name: string;
    title: string;
    inOfficeSince: Date;
    personality?: string[];      // AI can reference for speech generation
}

export interface Relation {
    nationId: string;
    stance: 'allied' | 'friendly' | 'neutral' | 'hostile' | 'at_war';
    treaties: string[];
}

// === WORLD STATE ===

export interface WorldState {
    date: Date;
    nations: Map<string, NationState>;
    activeEvents: TimelineEvent[];
    projectedEvents: TimelineEvent[];  // AI-generated future predictions
    historicalEvents: TimelineEvent[]; // Past events (immutable)
}

// === SCENARIO ===

export interface Scenario {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    focusRegion?: {
        center: [number, number];
        zoom: number;
    };
    initialNations: NationState[];
    seedEvents: TimelineEvent[];
    boundariesGeoJSON: string;   // Path to GeoJSON file
}

// === TIME CONTROL ===

export type TimeSpeed = 'paused' | 'day' | 'week' | 'month' | 'year';

export interface TimeState {
    currentDate: Date;
    speed: TimeSpeed;
    isPaused: boolean;
}

// === EVENT GENERATION ===

export interface EventGenerationContext {
    worldState: WorldState;
    recentEvents: TimelineEvent[];  // Last N events for context
    userDecisions: UserDecision[];
    focusNations?: string[];        // Which nations to prioritize
}

export interface UserDecision {
    id: string;
    timestamp: Date;
    nationId: string;
    type: 'policy' | 'diplomacy' | 'military' | 'economic';
    description: string;
    aiResponse?: string;
}

// === UTILITY TYPES ===

export interface EventFilter {
    types?: EventType[];
    scopes?: EventScope[];
    nations?: string[];
    startDate?: Date;
    endDate?: Date;
    onlyAiGenerated?: boolean;
}
