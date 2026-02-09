/**
 * Great Depression Events Dataset
 * 
 * Key historical events from 1925-1933 for timeline visualization.
 */

import type { TimelineEvent } from '../engine/types';

// Helper to create dates
const date = (year: number, month: number, day: number): Date => new Date(year, month - 1, day);

export const depressionEvents: TimelineEvent[] = [
    // === ACT I: THE ROAR (Background prosperity) ===
    {
        id: 'prosperity-peak',
        timestamp: date(1929, 9, 3),
        type: 'economic',
        scope: 'national',
        title: 'Market Peak',
        description: 'The Dow Jones reaches an all-time high of 381.17. Prosperity seems endless.',
        location: { coordinates: [-74.006, 40.7128], name: 'Wall Street, New York' },
        nations: ['USA'],
        causes: [],
        effects: ['black-thursday'],
        aiGenerated: false,
        tags: ['prosperity', 'peak']
    },

    // === ACT II: THE CRACK ===
    {
        id: 'black-thursday',
        timestamp: date(1929, 10, 24),
        type: 'economic',
        scope: 'global',
        title: 'Black Thursday',
        description: 'Stock prices begin to collapse. 12.9 million shares traded in panic selling.',
        location: { coordinates: [-74.006, 40.7128], name: 'Wall Street, New York' },
        nations: ['USA'],
        causes: ['prosperity-peak'],
        effects: ['black-tuesday'],
        aiGenerated: false,
        tags: ['crash', 'panic']
    },
    {
        id: 'black-tuesday',
        timestamp: date(1929, 10, 29),
        type: 'economic',
        scope: 'global',
        title: 'Black Tuesday',
        description: 'The stock market crashes. 16 million shares traded. $14 billion in value erased in one day.',
        location: { coordinates: [-74.006, 40.7128], name: 'Wall Street, New York' },
        nations: ['USA'],
        causes: ['black-thursday'],
        effects: ['bank-of-us', 'unemployment-rise'],
        aiGenerated: false,
        tags: ['crash', 'collapse', 'critical']
    },
    {
        id: 'smoot-hawley',
        timestamp: date(1930, 6, 17),
        type: 'political',
        scope: 'global',
        title: 'Smoot-Hawley Tariff',
        description: 'Congress passes massive tariffs. Trading partners retaliate. International trade collapses.',
        location: { coordinates: [-77.0369, 38.9072], name: 'Washington, D.C.' },
        nations: ['USA'],
        causes: ['black-tuesday'],
        effects: [],
        aiGenerated: false,
        tags: ['policy', 'trade']
    },
    {
        id: 'bank-of-us',
        timestamp: date(1930, 12, 11),
        type: 'economic',
        scope: 'national',
        title: 'Bank of United States Fails',
        description: 'The largest bank failure in American history. 400,000 depositors lose their savings.',
        location: { coordinates: [-74.006, 40.7128], name: 'New York' },
        nations: ['USA'],
        causes: ['black-tuesday'],
        effects: ['bank-panic-1931'],
        aiGenerated: false,
        tags: ['bank-failure', 'panic']
    },
    {
        id: 'bank-panic-1931',
        timestamp: date(1931, 3, 1),
        type: 'economic',
        scope: 'national',
        title: 'Bank Panic Spreads',
        description: 'Over 2,000 banks fail across the country. Runs on banks become common.',
        location: { coordinates: [-87.6298, 41.8781], name: 'Chicago' },
        nations: ['USA'],
        causes: ['bank-of-us'],
        effects: [],
        aiGenerated: false,
        tags: ['bank-failure', 'cascade']
    },
    {
        id: 'dust-bowl-begins',
        timestamp: date(1931, 7, 1),
        type: 'social',
        scope: 'regional',
        title: 'Dust Bowl Begins',
        description: 'Severe drought hits the Great Plains. Topsoil blows away. Farmers face ruin.',
        location: { coordinates: [-101.8313, 35.2220], name: 'Texas Panhandle' },
        nations: ['USA'],
        causes: [],
        effects: ['migration-west'],
        aiGenerated: false,
        tags: ['drought', 'agriculture', 'disaster']
    },
    {
        id: 'detroit-unemployment',
        timestamp: date(1931, 8, 1),
        type: 'economic',
        scope: 'local',
        title: 'Detroit Auto Industry Collapses',
        description: 'Auto production falls 75% from 1929. Half of Detroit\'s workers are unemployed.',
        location: { coordinates: [-83.0458, 42.3314], name: 'Detroit' },
        nations: ['USA'],
        causes: ['black-tuesday'],
        effects: [],
        aiGenerated: false,
        tags: ['unemployment', 'industry']
    },
    {
        id: 'bonus-army',
        timestamp: date(1932, 7, 28),
        type: 'political',
        scope: 'national',
        title: 'Bonus Army Dispersed',
        description: 'Army forcibly removes 17,000 WWI veterans demanding early pension payments from Washington.',
        location: { coordinates: [-77.0369, 38.9072], name: 'Washington, D.C.' },
        nations: ['USA'],
        causes: [],
        effects: [],
        aiGenerated: false,
        tags: ['protest', 'unrest']
    },

    // === ACT III: THE SILENCE (and first hope) ===
    {
        id: 'unemployment-peak',
        timestamp: date(1933, 3, 1),
        type: 'economic',
        scope: 'national',
        title: 'Unemployment Peaks',
        description: '25% of Americans are unemployed. 13 million people without work.',
        location: { coordinates: [-87.6298, 41.8781], name: 'Nationwide' },
        nations: ['USA'],
        causes: ['black-tuesday', 'bank-panic-1931'],
        effects: [],
        aiGenerated: false,
        tags: ['unemployment', 'crisis']
    },
    {
        id: 'fdr-inauguration',
        timestamp: date(1933, 3, 4),
        type: 'political',
        scope: 'national',
        title: 'FDR Inaugurated',
        description: '"The only thing we have to fear is fear itself." A new era begins.',
        location: { coordinates: [-77.0369, 38.9072], name: 'Washington, D.C.' },
        nations: ['USA'],
        causes: [],
        effects: ['bank-holiday'],
        aiGenerated: false,
        tags: ['hope', 'change', 'turning-point']
    },
    {
        id: 'bank-holiday',
        timestamp: date(1933, 3, 6),
        type: 'economic',
        scope: 'national',
        title: 'Bank Holiday Declared',
        description: 'FDR closes all banks for 4 days. Emergency Banking Act restores confidence.',
        location: { coordinates: [-77.0369, 38.9072], name: 'Washington, D.C.' },
        nations: ['USA'],
        causes: ['fdr-inauguration'],
        effects: [],
        aiGenerated: false,
        tags: ['recovery', 'hope', 'policy']
    }
];

// Helper functions
export function getEventById(id: string): TimelineEvent | undefined {
    return depressionEvents.find(e => e.id === id);
}

export function getEventsByYear(year: number): TimelineEvent[] {
    return depressionEvents.filter(e => new Date(e.timestamp).getFullYear() === year);
}

export function getEventsByTag(tag: string): TimelineEvent[] {
    return depressionEvents.filter(e => e.tags?.includes(tag));
}

export function getCrashEvents(): TimelineEvent[] {
    return getEventsByTag('crash').concat(getEventsByTag('bank-failure'));
}
