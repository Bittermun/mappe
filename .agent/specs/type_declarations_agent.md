# Type Declarations Agent Specification

## Context

The Mappe project uses `maplibre-contour` which lacks TypeScript type definitions. Currently, a `@ts-ignore` directive suppresses the type error, which defeats TypeScript's benefits.

**Problem Location:** [main.ts lines 3-4](file:///c:/Users/msunw/Downloads/mappe/src/main.ts#L3-L4)
```typescript
// @ts-ignore
import mlcontour from 'maplibre-contour';
```

---

## Objectives

1. Create proper type declarations for `maplibre-contour`
2. Remove the `@ts-ignore` directive
3. Enable full TypeScript intellisense for the library

---

## Implementation Steps

### Step 1: Research Library API

Examine current usage in `main.ts`:
```typescript
const demSource = new mlcontour.DemSource({
    url: 'https://...',
    encoding: 'terrarium',
    maxzoom: 12,
    worker: true,
});
demSource.setupMaplibre(maplibregl);
demSource.sharedDemProtocolUrl  // property
demSource.contourProtocolUrl({...})  // method
```

### Step 2: Create Type Declaration File

Create `src/types/maplibre-contour.d.ts`:

```typescript
declare module 'maplibre-contour' {
  import type { Map as MapLibreMap } from 'maplibre-gl';

  export interface DemSourceConfig {
    /** URL template for DEM tiles */
    url: string;
    /** DEM encoding format */
    encoding: 'terrarium' | 'mapbox';
    /** Maximum zoom level for DEM tiles */
    maxzoom?: number;
    /** Enable web worker processing */
    worker?: boolean;
  }

  export interface ContourOptions {
    /** Elevation multiplier */
    multiplier?: number;
    /** Contour thresholds by zoom level */
    thresholds: Record<number, number[]>;
    /** Key for elevation value in output */
    elevationKey?: string;
    /** Key for contour level in output */
    levelKey?: string;
    /** Layer name for contours */
    contourLayer?: string;
  }

  export class DemSource {
    constructor(config: DemSourceConfig);
    
    /** Register protocol handlers with MapLibre */
    setupMaplibre(maplibre: typeof import('maplibre-gl')): void;
    
    /** Protocol URL for shared DEM tiles */
    readonly sharedDemProtocolUrl: string;
    
    /** Generate protocol URL for contour tiles */
    contourProtocolUrl(options: ContourOptions): string;
  }
}
```

### Step 3: Update tsconfig.json

Add typeRoots to include local type declarations:
```json
{
  "compilerOptions": {
    "typeRoots": ["./src/types", "./node_modules/@types"]
  }
}
```

### Step 4: Remove @ts-ignore

Update `main.ts`:
```typescript
// Before
// @ts-ignore
import mlcontour from 'maplibre-contour';

// After
import mlcontour from 'maplibre-contour';
```

### Step 5: Verify Type Inference

Confirm that:
- `demSource` has proper type
- `demSource.contourProtocolUrl()` shows parameter hints
- No TypeScript errors in IDE or build

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| No @ts-ignore in codebase | Search: `grep -r "@ts-ignore" src/` returns empty |
| Build passes | `npm run build` succeeds |
| Types work | Hover over `demSource` shows `DemSource` type |
| Intellisense active | Typing `demSource.` shows method suggestions |

---

## Files Affected

| Action | File |
|--------|------|
| CREATE | `src/types/maplibre-contour.d.ts` |
| MODIFY | `tsconfig.json` |
| MODIFY | `src/main.ts` |

---

## Notes

- These types are based on observed usage; check library source for completeness
- Consider contributing types to DefinitelyTyped if stable
