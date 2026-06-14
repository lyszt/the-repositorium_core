---
name: Rspress Layout component override with conditional content injection
description: Override Rspress's built-in Layout component to inject custom-styled content into the doc content flow of specific pages based on route path
source: auto-skill
extracted_at: '2026-06-12T17:37:37.982Z'
---

# Procedure: Inject conditional content into Rspress pages via Layout override

## Problem

You want to add a custom element (e.g., a support/sponsor call-to-action, a banner, a notice) to every page under a specific path prefix (e.g., `/projects/`), without editing each markdown file individually. The element must match the site's design system (custom-styled card, not a raw embed/iframe).

## Solution: Wrap Rspress's built-in `Layout` component

Rspress's theme system allows you to override any of its built-in components by exporting them from your `theme/index.tsx`. The `Layout` component forwards slot props (like `afterDocContent`, `bottom`, `beforeDocFooter`, etc.) to the inner `DocLayout`. By wrapping `Layout` with a conditional component, you inject content only where needed, using a custom-styled element that respects the site's design tokens.

## Step-by-step

**1. Understand Rspress's theme override system**

In `theme/index.tsx`, re-export everything from `@rspress/core/theme-original` and override specific components:

```tsx
import './index.css';

export * from '@rspress/core/theme-original';
export { default as HomeLayout } from './HomeLayout';   // override home page
export { default as Layout } from './Layout';            // override main layout
```

Rspress automatically picks up the exported `Layout` component and uses it as the page shell.

**2. Create the custom Layout wrapper with a styled sponsor card**

Create `theme/Layout.tsx`:

```tsx
import { useLocation } from '@rspress/core/runtime';
import { Layout as OriginalLayout } from '@rspress/core/theme-original';
import type { LayoutProps } from '@rspress/core/theme';

function SponsorCard() {
  return (
    <div className="rp-sponsor-card">
      <div className="rp-sponsor-card__body">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 14.25s-5.5-3.5-5.5-7a3.5 3.5 0 0 1 6.5-1.73A3.5 3.5 0 0 1 13.5 7c0 3.5-5.5 7-5.5 7Z" />
        </svg>
        <div className="rp-sponsor-card__text">
          <strong>Support this project</strong>
          <span>Your sponsorship helps maintain and improve the tools documented here.</span>
        </div>
      </div>
      <a className="rp-sponsor-card__action" href="https://github.com/sponsors/lyszt"
         target="_blank" rel="noopener noreferrer">
        Sponsor<span aria-hidden="true">&nbsp;&#8599;</span>
      </a>
    </div>
  );
}

export default function Layout(props: LayoutProps) {
  const { pathname } = useLocation();
  const isTargetPage = pathname.startsWith('/projects/');

  if (!isTargetPage) {
    return <OriginalLayout {...props} />;
  }

  return (
    <OriginalLayout
      {...props}
      afterDocContent={
        <>
          {props.afterDocContent}
          <SponsorCard />
        </>
      }
    />
  );
}
```

**Key details:**

- `useLocation()` is imported from `@rspress/core/runtime` — a re-export of `react-router-dom`'s `useLocation`.
- Always spread `...props` onto the original Layout so other customizations (nav, sidebar, etc.) still work.
- Chain slot content with existing content using a Fragment: `{props.afterDocContent}<YourElement />`.
- **Do NOT use `bottom` for content that should appear within the doc content flow.** `bottom` renders at the very bottom of the entire page (after everything), which looks disconnected from the content.

**3. Choose the right slot for your content**

| Slot | Position | Use case |
|---|---|---|
| `afterDocContent` | Right after rendered markdown, before doc footer (edit link, prev/next) | **Best for CTAs, sponsor cards, notices** — within content flow |
| `beforeDocContent` | Right before rendered markdown | Banners, migration notices |
| `afterDocFooter` | After prev/next page links | Disclaimers, footnotes |
| `bottom` | Very bottom of the full page (outside content area) | Site-wide footer elements |
| `top` | Top of the full page (above nav) | Alert banners, maintenance notices |

**4. Style the card using the site's design tokens**

Add to `theme/index.css`. Use the site's existing CSS custom properties (OKLCH color vars) so the card respects both light and dark themes:

```css
.rp-sponsor-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin: 2.5rem 0;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--border);
  background: var(--surface);
}

.rp-sponsor-card__body {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--muted-foreground);
}

.rp-sponsor-card__body svg {
  flex-shrink: 0;
  color: var(--foreground);
}

.rp-sponsor-card__text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.rp-sponsor-card__text strong {
  font-weight: 600;
  color: var(--foreground);
}

.rp-sponsor-card__action {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--background);
  background: var(--foreground);
  text-decoration: none !important;
  transition: background 0.2s ease;
}

.rp-sponsor-card__action:hover {
  background: var(--foreground-hover);
}
```

**Key CSS principles:**
- Use `var(--surface)` for card background, `var(--border)` for borders — they adapt to light/dark automatically
- Use CSS variables from the site's custom properties (OKLCH color space) — never hardcode hex colors
- The action button inverts: `color: var(--background)` on `background: var(--foreground)` for a solid button
- Arrow / decorative icons use `--muted-foreground` for secondary text

**5. Verify the build**

```bash
npx rspress build
```

Check that:
- The custom content appears on target pages, within the doc content flow (before doc footer, not at page bottom)
- Non-target pages are unaffected
- The card respects both light and dark themes
- The original layout features (sidebar, nav, search) still work correctly

## Important lessons (from user feedback)

1. **Position matters.** Placing content via `bottom` renders it at the very bottom of the full page — below the sidebar, below the prev/next navigation. This feels disconnected and "ugly." Use `afterDocContent` to place it within the content flow, naturally before the prev/next page links.

2. **Don't embed raw iframes.** Third-party iframes (like GitHub Sponsors cards) don't respect the site's design system — they render white boxes on dark themes and vice versa. Instead, build a custom card using the site's own design tokens. The user will confirm this as "much better very good."

3. **Use the site's CSS custom properties.** `--surface`, `--border`, `--foreground`, `--muted-foreground`, `--background` are already defined for light and dark modes. Using them ensures the injected content matches without additional theme logic.

4. **Keep slot choices minimal.** You don't need a table of every slot prop in your component. Learn the 3–4 most useful ones (`afterDocContent`, `beforeDocContent`, `bottom`, `top`) and reach for the others only when needed.

## Route detection patterns

| Pattern | Code | When to use |
|---|---|---|
| Under a section | `pathname.startsWith('/projects/')` | All pages under `/projects/...` |
| Exact match | `pathname === '/projects/'` | Only the index page |
| Exact page | `pathname === '/projects/blade-zenon/'` | A specific page |
| Multiple sections | `pathname.startsWith('/projects/') \|\| pathname.startsWith('/guide/')` | Pages across sections |
| Not a page | `!pathname.startsWith('/projects/')` | All pages except project pages |

## When to use this approach

- You want to inject content into multiple pages without editing each markdown file
- The content should appear within the doc content flow (after the rendered markdown, before the doc footer)
- You need conditional logic (route-based) to decide where content appears
- The injected content needs to match the site's design system (custom-styled, not a raw embed)

## Alternative approaches

- **Remark/rehype plugin** — transforms the markdown AST; good for injecting into the document body itself, but harder to match site design tokens
- **CSS-only** — limited to decorative content; cannot render interactive elements like buttons
- **Per-page markdown includes** — requires editing every file; not DRY
- **Sibling rendering for fixed-position elements** — if the content is `position: fixed` (e.g., a floating widget like Google Translate), render it as a sibling of the layout rather than using a slot. Fixed-position elements are taken out of the document flow, so they don't need to be inside the layout structure:

```tsx
return (
  <>
    <OriginalLayout {...props} />
    <GoogleTranslate />  {/* fixed-position, renders outside content flow */}
  </>
);
```

This pattern is used for floating widgets (translate, cookie consent, feedback buttons) that should appear on every page regardless of layout type (doc, home, 404).
