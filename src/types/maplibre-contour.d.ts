declare module 'maplibre-contour' {
    export interface DemSourceConfig {
        url: string;
        encoding: 'terrarium' | 'mapbox';
        maxzoom?: number;
        worker?: boolean;
    }
    export interface ContourOptions {
        multiplier?: number;
        thresholds: Record<number, number[]>;
        elevationKey?: string;
        levelKey?: string;
        contourLayer?: string;
    }
    export class DemSource {
        constructor(config: DemSourceConfig);
        setupMaplibre(maplibre: typeof import('maplibre-gl')): void;
        readonly sharedDemProtocolUrl: string;
        contourProtocolUrl(options: ContourOptions): string;
    }
}
