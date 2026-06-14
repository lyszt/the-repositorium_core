---
name: Rspress project categories in ProjectsList
description: Add a new project category section to the projects index page, including fetch script logic, JSON data, component rendering, and visual treatment
source: auto-skill
extracted_at: '2026-06-12T18:49:59.824Z'
---

# Procedure: Add a new project category to the projects index

## Problem

The projects index (`/projects/`) has multiple categorized sections (e.g., "Core", "Legacy") rendered from `docs/data/github-repos.json`. You need to add a new category (e.g., "Phare" for flagship projects) that appears above existing sections, with a different visual treatment (featured card vs. table-of-contents entries).

This is a four-part change: fetch script, data, component, and sidebar.

## Step-by-step

### 0. Update `scripts/fetch-github-repos.mjs`

The fetch script determines categories automatically by repo name suffix — **not via a hardcoded set**. Adding a new category requires changes in three places:

**a) Add the suffix to `formatName` and `toSlug`** so the suffix is stripped when generating display names and slugs:

```js
function formatName(repoName) {
  return repoName
    .replace(/_core$|_phare$|_edu$|_legacy$/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toSlug(repoName) {
  return repoName
    .replace(/_core$|_phare$|_edu$|_misc$/, "")
    .replace(/_/g, "-")
    .toLowerCase();
}
```

**b) Add the suffix to the eligibility filter:**

```js
(r.name.endsWith("_core") || r.name.endsWith("_legacy") || r.name.endsWith("_phare"))
```

**c) Add a suffix-based routing branch in the categorization logic.** Remove any hardcoded Set lookup:

```js
if (!readme) continue;
if (r.name.endsWith("_phare")) phare.push(project);
else if (r.name.endsWith("_legacy")) legacy.push(project);
else core.push(project);
```

The key insight: **the repo suffix (`_phare`, `_core`, `_legacy`) determines the category automatically** — no manual slug list needed. On GitHub, you name the repo `eris-client_phare` and the script routes it correctly.

### 1. Add the category key to `docs/data/github-repos.json`

The JSON is a flat object where each key is a category label and each value is an array of project objects. Add your new key at the top (or desired position):

```json
{
  "phare": [
    {
      "slug": "eris-client",
      "name": "Eris Client",
      "desc": "A systems-level utility built in C for project management.",
      "url": "https://github.com/lyszt/eris-client_core",
      "homepage": "",
      "lang": "C",
      "stars": 2,
      "updatedAt": "2026-05-06T19:34:28Z"
    }
  ],
  "core": [
    // ... existing core projects
  ],
  "legacy": [
    // ... existing legacy projects
  ]
}
```

If you're moving a project from another category, remove its entry from the source category after adding it to the new one.

### 2. Destructure the new category in `theme/components/ProjectsList.tsx`

Update the destructuring at the top of the component and update the total count:

```tsx
const { phare, core, legacy } = reposData as {
  phare: Project[];
  core: Project[];
  legacy: Project[];
};

const total = phare.length + core.length + legacy.length;
```

### 3. Choose a visual treatment for the new category

There are two patterns in this component:

**Pattern A — Featured card** (for a small, high-profile category like "phare" with 1–3 projects): Renders as a full-width bordered card with larger typography, distinct from the entry list. Use this when the category should stand out visually.

```tsx
function PhareEntry({ p, delay }: { p: Project; delay: number }) {
  const year = formatYear(p.updatedAt);
  return (
    <a href={`/projects/${p.slug}/`}
       style={{ animationDelay: `${delay}ms` }}
       className="phare-entry group lux-rise flex flex-col gap-3 no-underline
                  border border-border rounded-sm p-6 md:p-8
                  transition-[background,border-color] duration-300
                  hover:bg-[color-mix(in_oklch,var(--foreground)_4%,transparent)]
                  hover:border-[color-mix(in_oklch,var(--foreground)_30%,transparent)]">
      {/* Header row: badge + metadata */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.6875rem] tracking-[0.2em] uppercase text-[var(--rp-c-brand)]">
          phare
        </span>
        <div className="flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.08em] text-muted-foreground/70">
          {p.lang && <span>{p.lang}</span>}
          {p.stars > 0 && <span>★ {p.stars}</span>}
          {year && <span>{year}</span>}
        </div>
      </div>

      {/* Title with hover arrow */}
      <h3 className="font-display text-3xl md:text-4xl leading-[1.1] text-foreground m-0">
        {p.name}
        <span aria-hidden className="... group-hover:opacity-100 ...">→</span>
      </h3>

      {/* Description */}
      {p.desc && <p className="text-sm md:text-base leading-relaxed text-muted-foreground m-0 max-w-2xl">{p.desc}</p>}
    </a>
  );
}
```

**Pattern B — Entry list** (for larger categories like "core" with many projects): Renders as a numbered table-of-contents with title, description, and metadata columns. Uses the existing `Entry` and `Section` components.

```tsx
<Section index="I" label="Core" projects={core} startDelay={...} />
```

### 4. Add the category rendering to the component's JSX

Place it before the existing sections to control ordering:

```tsx
{phare.length > 0 && (
  <section className="mt-16 first:mt-0">
    <header className="flex items-baseline justify-between mb-4">
      <h2 className="font-mono text-[0.6875rem] font-medium tracking-[0.22em] uppercase text-muted-foreground m-0">
        <span className="text-[var(--rp-c-brand)]">◆</span>
        <span className="mx-2 text-muted-foreground/40">/</span>
        Phare
      </h2>
    </header>
    <div className="flex flex-col gap-3">
      {phare.map((p, i) => (
        <PhareEntry key={p.slug} p={p} delay={i * 45} />
      ))}
    </div>
  </section>
)}
<Section index="I" label="Core" projects={core} startDelay={phare.length * 45} />
<Section index="II" label="Legacy" projects={legacy} startDelay={(phare.length + core.length) * 45} />
```

**Important:** Update the Roman numeral indices when adding a section at the top. If the original order was `I / Core, II / Legacy`, adding a new first section means: the new section gets no numeral (or a decorative symbol), Core becomes `I`, Legacy becomes `II`.

Also update the `startDelay` for each section: pass the cumulative count of projects from all preceding sections so the staggered entrance animation flows correctly.

### 5. (If needed) Update sidebar paths in `docs/data/sidebar.json`

If the new category uses a project slug different from what was previously in the JSON (e.g., `iris-client` → `eris-client` after a rename), update all references in `sidebar.json`:

```bash
# Find all occurrences
grep -n "old-slug" docs/data/sidebar.json
# Replace all
# Use edit() tool with replace_all: true
```

Each sidebar entry is a key like `"/projects/eris-client/"` with an array of link objects — both the key and the `"link"` values need updating.

### 6. Verify the build

```bash
npx rspress build
```

Check:
- The new section renders at the correct position (first/top)
- The Roman numeral indices are sequential (I, II, III...)
- Any moved projects no longer appear in their old category
- The total entry count at the top of the page reflects the correct sum
- The staggered animation delays flow naturally across sections

## Key design decisions

- **Featured card vs. entry list**: A small, high-profile category (1–3 projects) benefits from a distinct card layout with a border, larger title, and badge. Larger categories (10+ projects) work better as a compact table-of-contents list with numbering.
- **Section indexing**: Roman numerals (I, II, III) signal a printed/catalogue aesthetic. A decorative symbol (◆) can mark sections that don't fit the numeral sequence.
- **Animation delays**: `startDelay` accumulates across sections so that entries animate in left-to-right, top-to-bottom order regardless of section boundaries. Each entry gets `delay = (total preceding projects + its index) * 45ms`.
- **Project slug consistency**: The slug in `github-repos.json` must match the docs directory name under `docs/projects/{slug}/`. If a project is renamed, update both the JSON and the docs directory.

## When to use this approach

- Adding or renaming a project category in the Repositorium projects index
- Moving projects between categories
- Changing the visual treatment of a category (card vs. list)
- The data-driven pattern keeps the index page declarative: add data to JSON, add handling to component
