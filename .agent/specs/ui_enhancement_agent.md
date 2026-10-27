# UI Enhancement Agent Specification

## Context

The Mappe project has several UI/UX gaps:
1. Collapsible sections have icons but don't collapse
2. The glow style dropdown uses unstyled browser defaults
3. No error states when map fails to load
4. No mobile responsiveness

---

## Objectives

1. Implement collapsible control panel sections
2. Style the dropdown to match tactical theme
3. Add graceful error handling UI
4. Add basic mobile breakpoints

---

## Implementation Steps

### Step 1: Collapsible Sections

**Add to style.css:**
```css
.section-header {
    cursor: pointer;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-header:hover {
    color: var(--accent-color);
}

.collapse-icon {
    transition: transform 0.2s ease;
}

.control-section.collapsed .collapse-icon {
    transform: rotate(-90deg);
}

.control-section.collapsed .section-content {
    display: none;
}
```

**Add to main.ts (or controls module):**
```typescript
function setupCollapsibleSections() {
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.control-section');
            section?.classList.toggle('collapsed');
        });
    });
}

// Call in DOMContentLoaded or map.on('load')
setupCollapsibleSections();
```

### Step 2: Style Dropdown

**Add to style.css:**
```css
select {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    border: 1px solid var(--accent-color);
    color: var(--accent-color);
    padding: 6px 30px 6px 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300ffff' d='M2 4l4 4 4-4z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
}

select:hover {
    background-color: rgba(0, 255, 255, 0.1);
}

select:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

select option {
    background: #001122;
    color: var(--accent-color);
}
```

### Step 3: Error Boundary UI

**Add to index.html (before map div):**
```html
<div id="error-overlay" class="hidden">
    <div class="error-content">
        <h2>⚠ SYSTEM ERROR</h2>
        <p id="error-message">Map failed to initialize</p>
        <button id="retry-btn">RETRY</button>
    </div>
</div>
```

**Add to style.css:**
```css
#error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

#error-overlay.hidden {
    display: none;
}

.error-content {
    text-align: center;
    border: 2px solid #ff4444;
    padding: 40px;
    box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
}

.error-content h2 {
    color: #ff4444;
    margin: 0 0 20px 0;
}

#retry-btn {
    background: transparent;
    border: 1px solid #ff4444;
    color: #ff4444;
    padding: 10px 20px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
}

#retry-btn:hover {
    background: #ff4444;
    color: #000;
}
```

**Add to main.ts:**
```typescript
function showError(message: string) {
    const overlay = document.getElementById('error-overlay');
    const msgEl = document.getElementById('error-message');
    if (overlay && msgEl) {
        msgEl.textContent = message;
        overlay.classList.remove('hidden');
    }
}

document.getElementById('retry-btn')?.addEventListener('click', () => {
    location.reload();
});

// Update error handler
map.on('error', (e) => {
    console.error('MapLibre error:', e);
    if (e.error?.message?.includes('Failed to fetch')) {
        showError('Network error: Unable to load map tiles');
    }
});
```

### Step 4: Mobile Responsiveness

**Add to style.css:**
```css
@media (max-width: 768px) {
    #overlay {
        left: 10px;
        top: 10px;
        padding: 10px;
    }
    
    #overlay h1 {
        font-size: 0.9rem;
    }
    
    #overlay button {
        padding: 6px 8px;
        font-size: 0.65rem;
    }
    
    #control-panel {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 280px;
        border: none;
        border-left: 1px solid var(--accent-color);
    }
    
    #debug-log {
        width: calc(100% - 40px);
        left: 20px;
    }
}

@media (max-width: 480px) {
    #control-panel {
        width: 100%;
        border-left: none;
    }
}
```

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| Sections collapse | Click header, content hides |
| Dropdown styled | Matches tactical theme |
| Error shown | Disconnect network, reload |
| Mobile works | Resize browser < 768px |

---

## Files Affected

| Action | File |
|--------|------|
| MODIFY | `src/style.css` |
| MODIFY | `index.html` |
| MODIFY | `src/main.ts` |

---

## Preview Checklist

Before marking complete:
- [ ] Test all 4 collapsible sections
- [ ] Verify dropdown works on Firefox/Chrome/Safari
- [ ] Test error overlay with network disconnect
- [ ] Check mobile layout at 768px, 480px, 320px breakpoints
