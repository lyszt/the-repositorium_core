---
name: Google Translate floating widget in Rspress
description: Add a modern Google Translate language selector as a floating widget styled to match the site's design tokens
source: auto-skill
extracted_at: '2026-06-12T20:00:58.018Z'
---

# Procedure: Add a Google Translate floating widget to an Rspress site

## Problem

You want a language translation option on every page of an Rspress documentation site. Google Translate's default embed is visually mismatched (different fonts, colors, branding text) and its auto-scroll iframe banner interferes with page layout. The widget should look native, be positioned unobtrusively (e.g., bottom-right floating), and respect the site's light/dark theme.

## Solution: Inject Google Translate via a React component in the Layout override

Add a `GoogleTranslate` component to the custom `Layout` wrapper (or render it alongside the layout as a sibling). The component loads the Google Translate script dynamically via `useEffect`, positions the selector as a fixed floating element, and overrides Google's default styling to match the site.

## Step-by-step

### 1. Add the GoogleTranslate component to your Layout

In `theme/Layout.tsx` (or create a separate component file), add:

```tsx
import { useEffect } from 'react';

function GoogleTranslate() {
  useEffect(() => {
    // Prevent duplicate script injection
    if (document.getElementById('gt-script')) return;

    const script = document.createElement('script');
    script.id = 'gt-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Register the global callback Google Translate expects
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,pt,es,fr,de,it,ja,ko,zh-CN,ru,ar',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };
  }, []);

  return (
    <div className="rp-translate-float">
      <div id="google_translate_element" />
    </div>
  );
}
```

**Key details:**
- The script URL uses `//` (protocol-relative) — works on both `http://` and `https://`
- The `?cb=googleTranslateElementInit` query param tells Google Translate where to find the init function
- The init function must be set on `window` (global scope) because Google's script calls it by name
- Use a `useEffect` with empty deps so it runs once after mount
- Guard against duplicate injection by checking for `document.getElementById('gt-script')` — important since React strict mode may double-invoke effects
- `InLineLayout.SIMPLE` renders as a compact dropdown (no label text)

### 2. Render the component in your Layout

Since it's a fixed-position element, render it as a sibling of the main layout (outside the content flow):

```tsx
export default function Layout(props: LayoutProps) {
  // ... route detection, original Layout usage ...
  return (
    <>
      <OriginalLayout {...props} />
      <GoogleTranslate />
    </>
  );
}
```

This works because `position: fixed` takes it out of the normal document flow — it floats independently of the content.

### 3. Style the widget to match the site

Add to `theme/index.css`:

```css
/* Floating container — bottom-right corner */
.rp-translate-float {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 999;
}

/* Hide the Google Translate wrapper text/branding */
.rp-translate-float .goog-te-gadget {
  font-family: var(--font-sans) !important;
  font-size: 0 !important;
  color: transparent !important;
}

/* Style the <select> dropdown itself */
.rp-translate-float .goog-te-gadget .goog-te-combo {
  font-size: 0.8125rem;
  color: var(--foreground);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-family: var(--font-sans);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  /* Custom chevron arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  box-shadow: 0 2px 8px oklch(0 0 0 / 8%);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  min-width: 160px;
}

.rp-translate-float .goog-te-gadget .goog-te-combo:hover {
  border-color: var(--foreground);
  box-shadow: 0 4px 12px oklch(0 0 0 / 12%);
}

/* Hide Google's text branding (the "powered by Google" and language stats) */
.rp-translate-float .goog-te-gadget span {
  display: none !important;
}

/* Suppress the auto-scroll iframe banner Google injects at the top of the page */
body > .skiptranslate {
  display: none !important;
}
```

**What each override does:**

| Selector | Purpose |
|---|---|
| `.rp-translate-float` | Fixed-position container in bottom-right corner |
| `.goog-te-gadget` | Hides Google's wrapper text by setting font-size and color to transparent |
| `.goog-te-combo` | The actual `<select>` dropdown — styled with site tokens, custom chevron, no border-radius |
| `.goog-te-gadget span` | Hides the "Powered by Google" text and language statistics |
| `body > .skiptranslate` | Removes the top-of-page iframe banner that Google injects to auto-scroll the page |

### 4. Language configuration

The `includedLanguages` parameter determines which languages appear in the dropdown. Format is ISO 639-1 codes (two letters) separated by commas:

```js
includedLanguages: 'en,pt,es,fr,de,it,ja,ko,zh-CN,ru,ar'
```

Common languages:
- `en` — English
- `pt` — Portuguese
- `es` — Spanish
- `fr` — French
- `de` — German
- `it` — Italian
- `ja` — Japanese
- `ko` — Korean
- `zh-CN` — Chinese (Simplified)
- `ru` — Russian
- `ar` — Arabic

### 5. Verify the build

```bash
npx rspress build
```

**Note:** Google Translate is a client-side runtime widget — it won't appear during SSG build or in static HTML output. It only activates after the JavaScript runs in the browser. Verify it by running `npx rspress dev` and checking the rendered page.

## Key design decisions

- **Floating vs. inline**: A fixed-position floating widget (`bottom: 1.5rem; right: 1.5rem`) keeps the translate option available on every page without consuming layout space. Inline placement would push content around and look awkward on pages with short content.
- **Script injection via useEffect**: Google Translate's script must be loaded dynamically (not via a `<script>` tag in the HTML head) because it calls a global callback (`googleTranslateElementInit`) that React needs to register first.
- **!important in CSS**: Google's injected stylesheets use high-specificity selectors. `!important` is necessary to override their widget styling — this is one of the few cases where it's justified.
- **No custom UI**: This approach uses Google's native `<select>` element, styled to match. Building a custom React UI that calls the Google Translate API would be more work and break if Google changes their API.

## Known limitations

- Google Translate may fail on pages using client-side routing (SPA) because it doesn't re-translate on navigation. The widget still works — the user picks a language and the page translates, but navigating to a new page within the SPA may require re-selecting the language.
- The `body > .skiptranslate` rule suppresses Google's top-of-page iframe banner, but if Google changes their injection pattern, this may need updating.
- Google Translate's script is loaded from a third-party CDN — it may be blocked by ad blockers or privacy extensions in some browsers.

## When to use this approach

- You need a language translation option across all pages of an Rspress site
- You want the widget to look native (styled to match the site's light/dark theme)
- You want it unobtrusive — floating in a corner rather than embedded in the content
- You're okay with a third-party dependency (Google Translate CDN) for the client-side translation engine
