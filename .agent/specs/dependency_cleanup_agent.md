# Dependency Cleanup Agent Specification

## Context

The `package.json` has issues:
1. Package named "metallic-event" instead of project name
2. deck.gl dependencies declared but never imported
3. These unused packages bloat `node_modules` and build time

**Target File:** [package.json](file:///c:/Users/msunw/Downloads/mappe/package.json)

---

## Objectives

1. Remove unused deck.gl dependencies
2. Fix package name to match project
3. Verify build still works after cleanup
4. Reduce node_modules size

---

## Implementation Steps

### Step 1: Verify deck.gl is Unused

Search for any imports:
```bash
grep -r "deck.gl\|@deck.gl" src/
```

Expected result: No matches

### Step 2: Record Current State

```bash
# Record node_modules size before
du -sh node_modules/

# Record package-lock.json size
ls -la package-lock.json
```

### Step 3: Update package.json

**Before:**
```json
{
  "name": "metallic-event",
  "dependencies": {
    "maplibre-gl": "^4.0.0",
    "maplibre-contour": "^0.1.0",
    "deck.gl": "^9.0.0",
    "@deck.gl/core": "^9.0.0",
    "@deck.gl/layers": "^9.0.0",
    "@deck.gl/mapbox": "^9.0.0"
  }
}
```

**After:**
```json
{
  "name": "mappe",
  "dependencies": {
    "maplibre-gl": "^4.0.0",
    "maplibre-contour": "^0.1.0"
  }
}
```

### Step 4: Clean Install

```bash
# Remove existing modules
rm -rf node_modules package-lock.json

# Fresh install
npm install

# Record new sizes
du -sh node_modules/
ls -la package-lock.json
```

### Step 5: Verify Build

```bash
npm run build
npm run dev  # Test manually in browser
```

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| Build passes | `npm run build` succeeds |
| App works | Map loads, controls function |
| deck.gl removed | `ls node_modules | grep deck` returns empty |
| Package named correctly | `jq .name package.json` returns "mappe" |
| Size reduced | Compare before/after node_modules size |

---

## Expected Impact

| Metric | Before | After (estimated) |
|--------|--------|-------------------|
| Dependencies | 6 | 2 |
| node_modules | ~150MB+ | ~50MB |
| Install time | ~30s | ~10s |

---

## Files Affected

| Action | File |
|--------|------|
| MODIFY | `package.json` |
| REGENERATE | `package-lock.json` |

---

## Rollback Plan

If build fails:
```bash
git checkout package.json package-lock.json
npm install
```
