# Development Log

## TNO-Inspired Features

### Easy (1-2 hours)
1. **Super Events** - Full-screen dramatic overlays with glow + typewriter text
2. **Event Cards** - TNO-style dark cards with neon borders
3. **Typewriter Effect** - Character-by-character text reveal
4. **Map Ripples** - Pulse effects at event locations

### Medium (2-4 hours)
5. **Statistics Bars** - Economy, Unemployment, Stability, Mood, Bank Confidence

---

## Visual Enhancements

### Animated Highway Effect
```typescript
let offset = 0;
function animateRoads() {
    offset = (offset + 0.5) % 10;
    map.setPaintProperty('roads-core', 'line-dasharray', [0, offset, 1, 10 - offset]);
    requestAnimationFrame(animateRoads);
}
```

### Low Zoom Roads (< 4)
Vector tiles don't include roads at zoom 0-3. Use Natural Earth GeoJSON → show at zoom < 5 → fade when tiles appear.

---

## Graphics Puzzle (Deliberation)

### Problem 1: Place Labels
Major cities same size as hamlets. **Solution**: Filter OpenFreeMap `place` layer by `class`:
- city: 16px, minzoom 3
- town: 12px, minzoom 6
- village: 10px, minzoom 9
- hamlet: 8px or hide

### Problem 2: Contours/Hillshade Balance
Too subtle = invisible; too strong = distracting. **Solutions**:
- Zoom-based intensity (subtle low zoom, detailed high zoom)
- Quick presets: "Data Mode" vs "Terrain Mode"

### Problem 3: Settings Architecture
**Recommended layered approach:**
```
┌─────────────────────────────────┐
│  Quick Presets (visible)        │  "Data Mode" / "Terrain Mode"
├─────────────────────────────────┤
│  Category Toggles (visible)     │  Contours, Roads, Water ON/OFF
├─────────────────────────────────┤
│  Advanced (collapsed)           │  Individual sliders
└─────────────────────────────────┘
```
- 90% users: presets + toggles
- 10% power users: expand Advanced
- Future: new features get toggle, advanced goes in collapsed

### Action Plan
**Phase 1**: Zoom-based label sizing, 2 quick presets, collapse sliders
**Phase 2**: Custom labels if needed, context-aware opacity during events

---

## Interactive Regions & Data Details

### Interactive Regions
| Approach | Effort | Notes |
|----------|--------|-------|
| Click place labels → popup | Low | Uses existing data |
| State boundaries + hover | Medium | Add US states GeoJSON |
| Full region system | High | Defer until core stable |

**Recommendation**: Phase 1 = click labels for basic info, Phase 2 = state boundaries

### Extra Data Details
| Feature | Display | Priority |
|---------|---------|----------|
| Camera altitude | Main overlay ("Viewing from 50,000 ft") | High - fun, easy |
| Elevation at cursor | Corner panel on hover | Medium |
| Lat/lng coordinates | Corner panel (power user) | Low |
| Distance tool | Button-activated | Low |

**"Flight Deck" layout:**
```
┌──────────────────────────────────────────┐
│ DATE: Oct 29, 1929   ALTITUDE: 127,000ft │
│ MODE: CONTOUR        ZOOM: 4.2           │
└──────────────────────────────────────────┘
```

Camera altitude formula: `altitude_meters = 40075000 / (2^zoom)`

---

## Quick Wins (Easy + High Impact)

| Feature | Time | Notes |
|---------|------|-------|
| **Keyboard shortcuts** | 15m | Space=play, arrows=time |
| **Timeline progress bar** | 20m | 1929━━●━━1933 position indicator |
| **Event toast notifications** | 20m | Popups when events fire during auto-play |
| **Fullscreen button** | 5m | One line: `document.documentElement.requestFullscreen()` |
| **Quick-jump buttons** | 15m | "Black Tuesday", "FDR Inauguration" presets |
| **URL state** | 30m | Share links with date/location embedded |
| **Ambient audio** | 30m | Era music, radio static (TNO-style) |

### Top 3 Priority
1. Keyboard shortcuts (professional feel) ✅ DONE
2. Timeline progress bar (orientation)
3. Event toasts (makes auto-play feel alive) ✅ DONE

---

## Historical Map Data (1929)

### What We Have
- `world_1920.geojson` - Historical country boundaries
- `county-census-1930.json` - US population data
- `nations.json` - Nation metadata

### Roads Problem
**Natural Earth** = modern roads only, no historical. In 1929:
- Interstates didn't exist (built 1956+)
- Most roads unpaved
- Rail was dominant transport

### Recommendation
**Emphasize rail, de-emphasize roads.** More historically accurate for 1929.
- Rail network was extensive and well-documented
- OpenHistoricalMap has some historical rail data
- Overlay `world_1920.geojson` for period-accurate borders
