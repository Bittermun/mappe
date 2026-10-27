# Phase 1 Agent Prompts

Ready-to-use prompts for executing Phase 1 improvements in parallel.

---

## Prompt 1: Dependency Cleanup Agent

Copy this prompt to a new agent session:

```
Execute the dependency cleanup for the Mappe project at c:\Users\msunw\Downloads\mappe

## Task
1. Remove unused deck.gl dependencies from package.json
2. Rename package from "metallic-event" to "mappe"
3. Verify build still works

## Steps
1. First, verify deck.gl is unused: `grep -r "deck.gl\|@deck.gl" src/`
2. Update package.json:
   - Change "name" from "metallic-event" to "mappe"
   - Remove from dependencies:
     - "deck.gl": "^9.0.0"
     - "@deck.gl/core": "^9.0.0"
     - "@deck.gl/layers": "^9.0.0"
     - "@deck.gl/mapbox": "^9.0.0"
3. Run: rm -rf node_modules package-lock.json
4. Run: npm install
5. Verify: npm run build

## Success Criteria
- Build passes with zero errors
- `ls node_modules | grep deck` returns empty
- package.json name is "mappe"

See full spec: .agent/specs/dependency_cleanup_agent.md
```

---

## Prompt 2: Type Declarations Agent

Copy this prompt to a new agent session:

```
Add TypeScript type declarations for maplibre-contour in the Mappe project at c:\Users\msunw\Downloads\mappe

## Task
1. Create type declaration file for maplibre-contour
2. Update tsconfig.json to include local types
3. Remove @ts-ignore from main.ts

## Steps
1. Create src/types/maplibre-contour.d.ts with:

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

2. Update tsconfig.json - add to compilerOptions:
   "typeRoots": ["./src/types", "./node_modules/@types"]

3. In src/main.ts, remove lines 3-4:
   // @ts-ignore
   (keep the import, just remove the comment)

4. Verify: npm run build

## Success Criteria
- No @ts-ignore in codebase
- Build passes
- Hovering over demSource shows DemSource type

See full spec: .agent/specs/type_declarations_agent.md
```

---

## Execution Notes

- These two prompts can run **simultaneously** in separate agent sessions
- They modify different files, so no merge conflicts
- After both complete, proceed to Phase 2 (Dead Code → Modularization → UI)

---

## Phase 2 Preview

After Phase 1 completes, the next prompts will be:
1. **Dead Code Removal** - Remove 7 defunct state properties
2. **Modularization** - Split main.ts into modules
3. **UI Enhancement** - Collapsible sections, styled dropdown, mobile

## Phase 3 Preview
4. **Testing** - Add Vitest after modularization
