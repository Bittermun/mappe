# Testing Infrastructure Agent Specification

## Context

The Mappe project has zero test coverage. Adding a testing framework will:
- Catch regressions during refactoring
- Document expected behavior
- Enable confident future changes

---

## Objectives

1. Add Vitest testing framework (pairs with Vite)
2. Configure for TypeScript
3. Create initial test suite for utility functions
4. Add npm test script

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install -D vitest @vitest/ui jsdom
```

### Step 2: Create Vitest Configuration

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

### Step 3: Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Step 4: Update tsconfig.json

Add Vitest types:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### Step 5: Create Initial Tests

After modularization, create tests for utilities.

Example: `src/utils/debugLog.test.ts`
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM
beforeEach(() => {
    document.body.innerHTML = '<div id="log-content"></div>';
});

describe('debugLog', () => {
    it('adds log entry to DOM', () => {
        // Import after DOM is set up
        const { debugLog } = await import('./debugLog');
        debugLog('Test message', 'info');
        
        const logContent = document.getElementById('log-content');
        expect(logContent?.children.length).toBe(1);
        expect(logContent?.textContent).toContain('Test message');
    });

    it('applies correct class for error type', () => {
        const { debugLog } = await import('./debugLog');
        debugLog('Error message', 'error');
        
        const entry = document.querySelector('.log-entry');
        expect(entry?.classList.contains('error')).toBe(true);
    });

    it('limits log entries to 100', () => {
        const { debugLog } = await import('./debugLog');
        for (let i = 0; i < 105; i++) {
            debugLog(`Message ${i}`);
        }
        
        const logContent = document.getElementById('log-content');
        expect(logContent?.children.length).toBe(100);
    });
});
```

Example: `src/state/controlState.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { controlState } from './controlState';

describe('controlState', () => {
    it('has correct default values', () => {
        expect(controlState.contourOpacity).toBe(60);
        expect(controlState.glowStyle).toBe('soft');
        expect(controlState.layers.contours).toBe(true);
    });

    it('all layer toggles default to true', () => {
        Object.values(controlState.layers).forEach(value => {
            expect(value).toBe(true);
        });
    });
});
```

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| Vitest installed | `npx vitest --version` works |
| Tests run | `npm run test` executes |
| Tests pass | All tests green |
| Coverage works | `npm run test:coverage` generates report |

---

## Files Affected

| Action | File |
|--------|------|
| CREATE | `vitest.config.ts` |
| MODIFY | `package.json` |
| MODIFY | `tsconfig.json` |
| CREATE | `src/**/*.test.ts` (multiple) |

---

## Test Priority

After modularization, prioritize tests for:

1. **High Value**: `controlState` defaults
2. **High Value**: `debugLog` behavior
3. **Medium Value**: `setupSlider` / `setupToggle`
4. **Low Value**: Map style configuration (static data)

---

## Dependencies

> [!IMPORTANT]
> This spec should be executed AFTER the Modularization Agent spec, as it depends on having separated modules to test.

---

## Future Enhancements

- Add browser-based E2E tests with Playwright
- Visual regression testing for map rendering
- CI/CD integration with GitHub Actions
