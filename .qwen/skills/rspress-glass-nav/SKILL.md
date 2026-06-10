---
name: Rspress glass-morphism nav styling
description: Apply a glass-morphism (frosted glass) aesthetic to Rspress's built-in navigation bar by overriding .rspress-nav CSS
source: auto-skill
extracted_at: '2026-06-10T00:44:06.881Z'
---

# Procedure: Glass-morphism nav for Rspress

## Problem

Rspress's default nav bar is opaque and full-width. You want a frosted-glass look (translucent background, backdrop blur, rounded corners, subtle border) that matches a custom design system.

## Solution: Override `.rspress-nav` with !important CSS

Rspress applies inline styles to the nav. The only reliable way to override them is with `!important` on the `.rspress-nav` class. Your custom CSS file (e.g., `theme/index.css`) is the right place.

### Step-by-step

**1. Understand the nav's DOM structure**

Rspress renders the nav as a single fixed-position element:
```
<div class="rspress-nav" style="position: fixed; top: 0; ...">
  <div class="rspress-nav-container">
    <!-- logo, nav links, search, social links -->
  </div>
</div>
```

The nav is at `top: 0` and spans full width. The page content is offset by `--rp-nav-height` (typically 56px).

**2. Define the glass-morphism effect**

The core glass recipe uses three ingredients:
- **Semi-transparent background gradient** — use `color-mix(in oklch, ...)` to blend a surface color with transparency
- **Backdrop blur** — `backdrop-filter: blur(24px) saturate(180%)` for the frosted glass effect
- **Subtle border** — a semi-transparent border for definition, typically omitted at the top edge where it meets the viewport edge

```css
.rspress-nav {
  background: linear-gradient(
    to bottom right,
    color-mix(in oklch, var(--surface) 55%, transparent),
    color-mix(in oklch, var(--surface) 25%, transparent)
  ) !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  border: 1px solid color-mix(in oklch, var(--border) 50%, transparent) !important;
  border-top: none !important;
  border-radius: 0 0 16px 16px !important;
  box-shadow: 0 1px 4px oklch(0 0 0 / 4%) !important;
}
```

**3. Adapt for dark mode**

```css
.dark .rspress-nav {
  background: linear-gradient(
    to bottom right,
    oklch(1 0 0 / 3.5%),
    oklch(1 0 0 / 1%)
  ) !important;
  border: 1px solid oklch(1 0 0 / 6%) !important;
  border-top: none !important;
}
```

**4. Tune transparency iteratively**

Glass opacity is subjective. Adjust the gradient opacity percentages (e.g., 55%/25% → lower for more transparency) and the backdrop-filter blur radius until it looks right against your page background.

- Higher `blur()` → more frosted, less detail visible through the nav
- Higher gradient opacity → more opaque nav, less background shows through
- `saturate(180%)` prevents the blur from washing out colors

### Design tokens used

The approach assumes CSS custom properties (OKLCH color space) for theming:

| Variable | Light | Dark | Purpose |
|---|---|---|---|
| `--surface` | `oklch(0.97 0.004 255)` | `oklch(0.18 0.022 255)` | Base nav color |
| `--border` | `oklch(0.87 0.008 255)` | `oklch(1 0 0 / 9%)` | Nav border |

### When to use this approach

- You're customizing Rspress's default theme (not a fully custom layout)
- You have a CSS file imported in the theme entry point (`theme/index.tsx`)
- Your design system uses OKLCH colors and the `color-mix()` function
- You need the nav to feel "floating" rather than attached to the top of the page

### Key design decisions

- **`border-top: none`** — the nav is at `top: 0`, so a top border creates an unnecessary line at the viewport edge
- **`border-radius: 0 0 16px 16px`** — only bottom corners are visible since the nav is flush with the viewport top; this mirrors the tesserae `rounded-2xl` look
- **`!important`** on every property — Rspress applies inline styles that would otherwise override custom CSS
