# CONCEPT: AI-Driven Grand Strategy Simulation

> *"A super simulation where you immediately learn something from looking at it."*

---

## Vision

A grand strategy experience that combines:
- **DEFCON's aesthetic tension** — glowing vectors on dark canvas, information as drama
- **Hearts of Iron's depth** — regions, production, population, commanders
- **AI-native architecture** — the simulation *thinks*, not just calculates

The map is a living document. Cities grow. Borders shift. Events cascade. The AI deliberates over a hidden timeline, and every user decision ripples through history.

---

## Core Pillars

### 1. Visual Density ("Wow Factor")
At any zoom level, you should *learn* something. The map is not just terrain — it's a dashboard of civilization:
- Contours reveal strategic terrain
- City glow indicates population/activity  
- Regional shading shows production capacity
- Event markers pulse with significance

### 2. The Hidden Timeline
The AI maintains a probabilistic timeline of events:
```
Past ─────────── Present ─────────── Future
[fixed events]   [current state]    [AI projections]
                      ↑
                 User decisions
                 alter projections
```

Small events (factory opens, commander appointed, treaty signed) aggregate into large events (war, economic boom, revolution). The AI reasons about causality.

### 3. Actor Intelligence
Three tiers of AI personality:
- **Nations**: Grand strategy, alliances, doctrine
- **Commanders**: Tactical decisions, unit behavior, personality
- **Leaders**: Speech style, risk tolerance, historical flavor

These can interact, conflict, and surprise.

### 4. Spectator & Actor Modes
- **Spectator**: Watch AI history unfold, fast-forward, rewind
- **Leader**: Speak as a nation's voice, make decisions, see consequences
- **Sandbox**: Full control, test scenarios, observe AI reasoning

---

## Technical Architecture (Scholastic Structure)

```
PARS PRIMA: The World
├── Terrain Layer (MapLibre + contours)
├── Political Layer (regions, borders, claims)
├── Economic Layer (production, resources, trade)
└── Population Layer (cities, density, growth patterns)

PARS SECUNDA: The Timeline
├── Event Engine (generation, causality, probability)
├── State Machine (world state at each tick)
├── Mutation System (user decisions → timeline changes)
└── Replay System (scrub through history)

PARS TERTIA: The Actors
├── Nation AI (strategic reasoning)
├── Commander AI (tactical reasoning)  
├── Leader AI (personality, speech generation)
└── Interaction Layer (AI-to-AI diplomacy, conflict)

PARS QUARTA: The Interface
├── Map Visualization (this project's current state)
├── Timeline Scrubber (navigate history)
├── Decision UI (make choices as leader)
└── Event Feed (what's happening, why)
```

---

## Principles

1. **Information density over simplicity** — Every pixel should inform
2. **AI reasoning over scripted events** — Emergence, not choreography
3. **Causality over randomness** — Events have reasons
4. **Aesthetic drama** — War should feel tense, growth should feel alive

---

## Inspiration

- DEFCON (aesthetic, tension)
- Victoria 3 (population, economy simulation)
- Crusader Kings (personality-driven history)
- Light shows (visual drama, immediate impact)
- Scholastic method (structured reasoning, hierarchical decomposition)
