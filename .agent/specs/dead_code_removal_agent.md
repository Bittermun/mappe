# Dead Code Removal Agent Specification

## Context

The `controlState` object in `main.ts` contains several properties that are never used:
- `contourDistance`
- `cityDistance`
- `roadsDistance`
- `railDistance`
- `ferryDistance`
- `detailBoost`
- `crtIntensity`

The HTML includes collapse icons that don't function.

> [!IMPORTANT]
> **User Decision**: Option A selected - REMOVE the 7 defunct properties

---

## Objectives

### Option A: Remove Dead Code (Recommended)
Remove unused state properties and simplify the codebase.

### Option B: Wire Up Controls
Implement the intended functionality for each dead property.

---

## Implementation Steps (Option A: Remove)

### Step 1: Identify Dead Properties

Properties in `controlState` (lines 22-30) never referenced elsewhere:
```typescript
contourDistance: 0,    // Never used
cityDistance: 0,       // Never used
roadsDistance: 0,      // Never used
railDistance: 0,       // Never used
ferryDistance: 0,      // Never used
detailBoost: 1,        // Never used
crtIntensity: 25,      // Never used
```

### Step 2: Remove from State

Update `controlState` to only include used properties:
```typescript
const controlState = {
    contourOpacity: 60,
    contourGlow: 2,
    cityOpacity: 80,
    cityGlow: 4,
    glowStyle: 'soft' as 'soft' | 'neon' | 'hard' | 'subtle' | 'none',
    layers: {
        contours: true,
        cities: true,
        water: true,
        roads: true,
        rail: true,
        ferry: true,
        borders: true
    },
    logOpen: false
};
```

### Step 3: Document Removed Features

Add comment explaining what was removed:
```typescript
// NOTE: Distance controls and CRT effect were planned but not implemented.
// See git history for original state shape if needed.
```

---

## Implementation Steps (Option B: Wire Up)

### If User Chooses to Implement CRT Intensity:

1. Add slider to HTML:
```html
<label>
  <span>CRT Effect</span>
  <input type="range" id="crt-intensity" min="0" max="100" value="25" />
  <span id="crt-intensity-val">25%</span>
</label>
```

2. Add CSS variable control:
```typescript
setupSlider('crt-intensity', (val) => {
    document.documentElement.style.setProperty(
        '--crt-opacity', 
        `${val / 100}`
    );
});
```

3. Update CSS:
```css
#overlay::after {
    background: linear-gradient(
        rgba(18, 16, 16, 0) 50%, 
        rgba(0, 0, 0, calc(0.25 * var(--crt-opacity, 1))) 50%
    );
}
```

### If User Chooses to Implement Distance Controls:

These would require complex MapLibre filter expressions. Recommend deferring.

---

## Success Criteria (Option A)

| Criterion | Verification |
|-----------|--------------|
| Dead properties removed | `grep "Distance" src/main.ts` returns empty |
| Build passes | `npm run build` succeeds |
| No behavioral change | App works identically |

## Success Criteria (Option B)

| Criterion | Verification |
|-----------|--------------|
| Each control functional | Slider changes visible effect |
| Build passes | `npm run build` succeeds |
| No console errors | Browser console clean |

---

## Files Affected

| Action | File |
|--------|------|
| MODIFY | `src/main.ts` |
| MODIFY (if Option B) | `index.html` |
| MODIFY (if Option B) | `src/style.css` |

---

## Recommendation

**Option A (Remove)** is recommended because:
1. Simpler is better for maintainability
2. Distance controls would require significant complexity
3. CRT effect is purely cosmetic and may cause performance issues
4. Features can be added later if needed

User should confirm which approach before proceeding.
