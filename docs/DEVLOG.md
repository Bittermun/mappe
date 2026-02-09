# Development Log

## Scenario Idea: Pre-Depression Start
**Timeline Start:** Summer 1929 (a few months before Black Tuesday, October 29, 1929)

The simulation begins in apparent prosperity. The AI timeline holds the impending crash as a high-probability future event. User decisions (as a national leader) can:
- Attempt to prevent or mitigate the crash
- Position their nation to exploit the chaos
- Watch as spectator while AI-driven history unfolds

This creates dramatic irony — the player knows what's coming, the AI actors don't (or do they suspect?).

---

## Entry 001 — Foundation Analysis
**Date:** 2026-02-06

### Current State
The project has a working MapLibre GL visualization with:
- Terrarium DEM-based contours (maplibre-contour)
- OpenFreeMap vector overlays (roads, buildings, water)
- Dual mode: satellite vs tactical contour view
- Settings panel (currently non-functional)

### Issues Identified

| Issue | Status | Priority |
|-------|--------|----------|
| Settings panel controls don't affect map | 🟢 Fixed | Done |
| Contours lack density at low zoom | 🟡 Design gap | High |
| DEM maxzoom was 13, now 15 | 🟢 Fixed | Done |
| No visual hierarchy for "wow" factor | 🟡 Design gap | Medium |

### Settings Panel Fix Details
**Root cause:** Controls were mode-dependent. `setupControls()` ran on load, but contour layers only exist in contour mode. Sliders silently failed because `map.getLayer()` returned false.

**Solution:** Introduced `controlState` object to persist values + `applyControlState()` function that applies them when in contour mode. Now:
- Slider values persist across mode switches
- State is applied after each style.load event
- No duplicate event listeners

### Strategy Note: Scholastic Method
Applied the scholastic *quaestio* structure to debugging:
- Ask precise questions, not vague ones
- Consider *sed contra* (counterarguments) before committing to solution
- I initially solved "zoom IN detail" when the goal was "zoom OUT detail" — a failure of understanding intent

---

## Foundation Goals

### Goal 1: Fix Settings Panel
The sliders and toggles should control layer opacity, glow, and visibility. Currently the event handlers may not be connected properly after style changes.

**Hypothesis:** `setupControls()` runs but layers don't exist yet when called.

### Goal 2: Visual Density at Low Zoom
The "wow factor" requires seeing meaningful contours at z8-10, not just at z14+. Options:
1. Adjust thresholds to show finer contours earlier
2. Add synthetic detail layers (hillshade, slope visualization)
3. Increase contour line prominence at low zoom

### Goal 3: Information Layering
For the grand strategy vision, the map needs to support:
- City markers with population-proportional glow
- Regional boundaries with political shading
- Event markers (pulsing points of interest)
- Timeline-responsive visualization (things change over time)

---

## Strategy Tips

### On Debugging
1. **State the actual goal first** — Don't jump to hypotheses
2. **Check if the solution matches the goal** — I fixed zoom-in when goal was zoom-out
3. **Trace data flow** — Contours depend on DEM, which depends on tiles, which have fixed resolution

### On Architecture
1. **Build layers that can evolve** — The map is foundation for simulation
2. **Separate concerns** — Visualization ≠ Data ≠ AI reasoning
3. **Design for scrubbing** — Everything should work at different timeline positions

### On AI Integration (Future)
1. **AI deliberation should be explainable** — Show reasoning, not just results
2. **Events chain causally** — Small → medium → large
3. **Personalities create variance** — Same situation, different leaders = different outcomes

---

## Next Actions

1. [x] Debug settings panel — fixed with state-based architecture
2. [x] Add hillshade layer for immediate terrain "wow"
3. [x] Cities visible at strategic scale (z3-4)
4. [x] Terrain mode selector (Hillshade/Contours/Both)
5. [ ] Prototype timeline engine for AI-driven events
6. [ ] Add first AI-reasoned historical scenario
