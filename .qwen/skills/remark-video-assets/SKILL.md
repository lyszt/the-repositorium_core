---
name: Rspress remark plugin for GitHub asset video rendering
description: Create a remark plugin that converts bare GitHub attachment/asset URLs into rendered <video> elements in Rspress/MDX
source: auto-skill
extracted_at: '2026-06-10T00:44:06.881Z'
---

# Procedure: GitHub asset URLs → rendered `<video>` in Rspress

## Problem

GitHub attachment URLs (from `https://github.com/user-attachments/assets/{uuid}` or `https://github.com/{owner}/{repo}/assets/{id}`) render as plain text in Rspress MDX pages instead of inline `<video>` elements. Markdown has no native video syntax.

## Solution: remark plugin that transforms the mdast tree

Rather than editing every markdown file to use a custom `<Video>` component, write a **remark plugin** that automatically detects bare GitHub asset URLs in paragraph text nodes and replaces them with HTML `<video>` tags.

### Step-by-step

**1. Create the plugin file**

Place it at `theme/lib/remark-github-video.ts`:

```typescript
/**
 * Remark plugin that converts bare GitHub asset URLs on their own line
 * into rendered <video> elements.
 */
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

// Match both user-attachments and repo-specific asset URLs as the sole content of a text node
const GITHUB_ASSET_RE =
  /^https:\/\/github\.com\/(?:user-attachments\/assets\/[\w-]+|[\w-]+(?:\/[\w-]+)?\/assets\/[\w-]+)$/;

const remarkGithubVideo: Plugin<[], Root> = () => {
  return (tree) => {
    const { children } = tree;
    if (!children) return;

    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.type !== 'paragraph') continue;

      const paragraph = node as import('mdast').Paragraph;
      if (!paragraph.children || paragraph.children.length !== 1) continue;

      const child = paragraph.children[0];
      if (child.type !== 'text') continue;

      const url = child.value.trim();
      if (!GITHUB_ASSET_RE.test(url)) continue;

      // Replace the paragraph node with an HTML node containing a <video> element
      (children[i] as unknown) = {
        type: 'html',
        value: `<video controls src="${url}" class="w-full rounded-lg"></video>`,
      };
    }
  };
};

export default remarkGithubVideo;
```

**Why `type: 'html'`?** In mdast, an `html` node is treated as raw HTML that passes through to the final output. MDX handles this natively — no additional rehype plugin needed.

**Why iterate over `tree.children` directly?** Avoids external dependencies like `unist-util-visit`. For a flat scan of top-level paragraph nodes, a simple `for` loop is sufficient and keeps the plugin zero-dependency.

**2. Register in `rspress.config.ts`**

```typescript
import remarkGithubVideo from './theme/lib/remark-github-video';

export default defineConfig({
  // ...
  markdown: {
    remarkPlugins: [remarkGithubVideo],
  },
  // ...
});
```

**3. No changes to markdown files needed**

Any bare GitHub asset URL on its own line in any `.md`/`.mdx` file will now render as a `<video controls>` element.

### URL patterns matched

- `https://github.com/user-attachments/assets/{uuid}` — GitHub attachment uploads
- `https://github.com/{owner}/{repo}/assets/{id}` — repository-specific asset URLs

### Important considerations

- The regex requires the URL to be the **sole content** of the text node (after trim). A URL with surrounding text won't match — this prevents false positives.
- Only **top-level paragraph nodes** are checked. Nested paragraphs (e.g., inside blockquotes or list items) are not transformed. Extend to a recursive walk if needed.
- The `class` attribute on the `<video>` element uses Tailwind classes. Adjust to match your design system.

### When to use this approach

- You have multiple pages with bare GitHub asset URLs that should render as video
- You prefer zero changes to source markdown files (transform at build time)
- You need a dependency-free remark plugin (no install of `unist-util-visit` etc.)
