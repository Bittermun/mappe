# Modularization Agent Specification

## Context

The Mappe project currently has all application logic in a single `main.ts` file (637 lines). This monolithic structure makes the codebase difficult to maintain, test, and extend.

**Target File:** [main.ts](file:///c:/Users/msunw/Downloads/mappe/src/main.ts)

---

## Objectives

1. Split `main.ts` into logical modules
2. Maintain 100% functional equivalence
3. Improve code organization and readability
4. Enable future unit testing of individual modules

---

## Implementation Steps

### Step 1: Create Directory Structure

```
src/
├── main.ts              # Slim entry point
├── config/
│   └── mapStyle.ts      # contourStyle object
├── controls/
│   ├── index.ts         # Control setup exports
│   ├── sliders.ts       # setupSlider function
│   ├── toggles.ts       # setupToggle function
│   └── glowStyles.ts    # applyGlowStyle + glowConfigs
├── state/
│   └── controlState.ts  # State object + types
├── utils/
│   └── debugLog.ts      # Debug logging utility
└── types/
    └── index.ts         # Shared TypeScript interfaces
```

### Step 2: Extract State Management

Create `src/state/controlState.ts`:
- Move lines 18-42 (controlState object)
- Export as named export
- Add TypeScript interface for state shape

### Step 3: Extract Debug Logger

Create `src/utils/debugLog.ts`:
- Move lines 44-60 (debugLog function)
- Export as named export
- Keep DOM dependency (document.getElementById)

### Step 4: Extract Map Style

Create `src/config/mapStyle.ts`:
- Move lines 62-399 (contourStyle object)
- Import demSource from main
- Export as named export

### Step 5: Extract Control Logic

Create `src/controls/sliders.ts`:
- Move setupSlider function (lines 563-575)

Create `src/controls/toggles.ts`:
- Move setupToggle function (lines 577-589)

Create `src/controls/glowStyles.ts`:
- Move glowConfigs object (lines 517-523)
- Move applyGlowStyle function (lines 511-561)

Create `src/controls/index.ts`:
- Move setupControls function (lines 439-508)
- Import from sliders, toggles, glowStyles

### Step 6: Refactor main.ts

The final `main.ts` should only contain:
- Imports from all modules
- DEM source initialization (lines 6-14)
- Map instance creation (lines 401-409)
- toggleMode function (lines 412-422)
- Event handlers (lines 426-437, 591-637)

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| Build passes | Run `npm run build` with zero errors |
| Dev server works | Run `npm run dev` and verify map loads |
| All features work | Toggle mode, adjust sliders, toggle layers |
| No functional regression | Compare behavior to pre-refactor version |
| Each file < 150 lines | Use wc -l to verify |

---

## Files Affected

| Action | File |
|--------|------|
| MODIFY | `src/main.ts` |
| CREATE | `src/state/controlState.ts` |
| CREATE | `src/utils/debugLog.ts` |
| CREATE | `src/config/mapStyle.ts` |
| CREATE | `src/controls/sliders.ts` |
| CREATE | `src/controls/toggles.ts` |
| CREATE | `src/controls/glowStyles.ts` |
| CREATE | `src/controls/index.ts` |
| CREATE | `src/types/index.ts` |

---

## Rollback Plan

If build fails after refactoring:
1. Revert main.ts from git: `git checkout src/main.ts`
2. Delete new files: `rm -rf src/config src/controls src/state src/utils src/types`
3. Investigate error messages
4. Retry with smaller incremental changes
