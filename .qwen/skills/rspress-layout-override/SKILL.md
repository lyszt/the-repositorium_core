---
name: Rspress Layout component override with conditional content injection
description: Override Rspress's built-in Layout component to inject custom content (e.g., a sponsor iframe) at the bottom of specific pages based on route path
source: auto-skill
extracted_at: '2026-06-12T17:37:37.982Z'
---

# Procedure: Inject conditional content into Rspress pages via Layout override

## Problem

You want to add a custom element (e.g., a GitHub Sponsors iframe, a banner, a call-to-action) to the bottom of every page under a specific path prefix (e.g., `/projects/`), without editing each markdown file individually.

## Solution: Wrap Rspress's built-in `Layout` component

Rspress's theme system allows you to override any of its built-in components by exporting them from your `theme/index.tsx`. The `Layout` component accepts a `bottom` prop that renders content at the very bottom of every page. By wrapping `Layout` with a custom component that conditionally passes content via `bottom`, you avoid touching Rspress internals or individual page files.

## Step-by-step

**1. Understand Rspress's theme override system**

In `theme/index.tsx`, you re-export everything from `@rspress/core/theme-original` and then override specific components:

```tsx
import './index.css';

export * from '@rspress/core/theme-original';
export { default as HomeLayout } from './HomeLayout';   // override home page
export { default as Layout } from './Layout';            // override main layout
```

Rspress automatically picks up the exported `Layout` component and uses it as the page shell.

**2. Create the custom Layout wrapper**

Create `theme/Layout.tsx`:

```tsx
import { useLocation } from '@rspress/core/runtime';
import { Layout as OriginalLayout } from '@rspress/core/theme-original';
import type { LayoutProps } from '@rspress/core/theme';

export default function Layout(props: LayoutProps) {
  const { pathname } = useLocation();

  // Condition: only inject content on pages under /projects/
  const isTargetPage = pathname.startsWith('/projects/');

  if (!isTargetPage) {
    // Pass through unchanged for non-target pages
    return <OriginalLayout {...props} />;
  }

  return (
    <OriginalLayout
      {...props}
      bottom={
        <>
          {props.bottom}
          <div className="rp-custom-footer">
            <iframe
              src="https://github.com/sponsors/lyszt/card"
              title="Sponsor lyszt"
              height="225"
              width="600"
              style={{ border: 0 }}
            />
          </div>
        </>
      }
    />
  );
}
```

**Key details:**

- `useLocation()` is imported from `@rspress/core/runtime` — it's a re-export of `react-router-dom`'s `useLocation`.
- The `Layout` component's `bottom` prop renders content after the main page content (nav, content area, etc.). Other available slot props include `top`, `beforeNav`, `afterNav`, `beforeDoc`, `afterDoc`, `beforeDocContent`, `afterDocContent`, `beforeDocFooter`, `afterDocFooter`, `beforeSidebar`, `afterSidebar`, `beforeOutline`, `afterOutline`.
- Always spread `...props` onto the original Layout so all other customization (nav, sidebar, etc.) still works.
- If the original `bottom` prop already has content (e.g., from other customizations), chain it with the new content using a Fragment.

**3. Add accompanying CSS**

Add styles in `theme/index.css` to position and space the injected content:

```css
.rp-custom-footer {
  display: flex;
  justify-content: center;
  padding: 3rem 1.5rem 4rem;
  border-top: 1px solid var(--border);
  margin-top: 3rem;
}
```

**4. Verify the build**

```bash
npx rspress build
```

Check that:
- The custom content appears on target pages (e.g., `/projects/some-project/`)
- Non-target pages are unaffected (e.g., `/guide/`, `/index.html`)
- The original layout features (sidebar, nav, search) still work correctly

## Route detection patterns

| Pattern | Code | When to use |
|---|---|---|
| Under a section | `pathname.startsWith('/projects/')` | All pages under `/projects/...` |
| Exact match | `pathname === '/projects/'` | Only the index page |
| Exact page | `pathname === '/projects/blade-zenon/'` | A specific page |
| Multiple sections | `pathname.startsWith('/projects/') \|\| pathname.startsWith('/guide/')` | Pages across sections |
| Not a page | `!pathname.startsWith('/projects/')` | All pages except project pages |

## Available Layout slot props

| Prop | Position |
|---|---|
| `top` | Above everything (before nav) |
| `bottom` | Below everything (after page content) |
| `beforeNav` | Just before the nav bar |
| `afterNav` | Just after the nav bar |
| `beforeDoc` | At the start of the document content area |
| `afterDoc` | At the end of the document content area |
| `beforeDocContent` | Before the rendered markdown content |
| `afterDocContent` | After the rendered markdown content |
| `beforeDocFooter` | Before the doc footer (edit link, prev/next) |
| `afterDocFooter` | After the doc footer |
| `beforeSidebar` | Above the sidebar |
| `afterSidebar` | Below the sidebar |
| `beforeOutline` | Above the table of contents outline |
| `afterOutline` | Below the table of contents outline |
| `beforeHero` | Before the home hero section |
| `afterHero` | After the home hero section |
| `beforeFeatures` | Before the home features section |
| `afterFeatures` | After the home features section |
| `beforeNavMenu` | Before the nav menu items |
| `afterNavMenu` | After the nav menu items |

## When to use this approach

- You want to inject content into multiple pages without editing each markdown file
- The content placement matches one of the Layout slot props (typically `top` or `bottom`)
- You need conditional logic (route-based, frontmatter-based, or environment-based) to decide where content appears
- You prefer a React component wrapper over CSS-only solutions or remark/rehype plugins

## Alternative approaches

- **Remark/rehype plugin** — transforms the markdown AST; good for injecting into the document body itself (e.g., after every heading), but harder to inject outside the content area
- **CSS `::after` / `::before`** — limited to decorative content; cannot render interactive elements like iframes
- **Per-page markdown includes** — requires editing every file; not DRY
