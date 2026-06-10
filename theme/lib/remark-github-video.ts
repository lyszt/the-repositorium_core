/**
 * Remark plugin that converts bare GitHub asset URLs on their own line
 * into rendered <video> elements.
 *
 * Matches paragraphs whose entire content is a URL like:
 *   https://github.com/user-attachments/assets/{uuid}
 *   https://github.com/{owner}/{repo}/assets/{id}
 *
 * GitHub hosts video uploads at these URLs and renders them inline; in
 * plain markdown they'd just be links. Note that GFM autolinking turns
 * bare URLs into `link` nodes before this plugin runs, so both `text`
 * and `link` children must be handled.
 */
import type { Paragraph, Parent, Root } from 'mdast';
import type { Plugin } from 'unified';

const GITHUB_ASSET_RE =
  /^https:\/\/github\.com\/(?:user-attachments\/assets\/[\w-]+|[\w.-]+\/[\w.-]+\/assets\/[\w-]+)$/;

function paragraphAssetUrl(p: Paragraph): string | null {
  if (!p.children || p.children.length !== 1) return null;
  const child = p.children[0];

  if (child.type === 'text') {
    const url = child.value.trim();
    return GITHUB_ASSET_RE.test(url) ? url : null;
  }

  // GFM autolink: bare URL became a link whose text mirrors the URL
  if (child.type === 'link' && GITHUB_ASSET_RE.test(child.url)) {
    const inner = child.children?.[0];
    if (!inner || (inner.type === 'text' && inner.value.trim() === child.url)) {
      return child.url;
    }
  }

  return null;
}

function walk(parent: Parent): void {
  for (let i = 0; i < parent.children.length; i++) {
    const node = parent.children[i];

    if (node.type === 'paragraph') {
      const url = paragraphAssetUrl(node as Paragraph);
      if (url) {
        parent.children[i] = {
          type: 'html',
          value: `<video controls playsinline src="${url}" style="max-width:100%;border-radius:8px;margin:1rem 0;"></video>`,
        } as never;
      }
      continue;
    }

    if ('children' in node) walk(node as Parent);
  }
}

const remarkGithubVideo: Plugin<[], Root> = () => (tree: Root) => walk(tree);

export default remarkGithubVideo;
