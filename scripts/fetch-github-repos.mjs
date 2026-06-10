import { writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_OUT = resolve(ROOT, "docs/data/github-repos.json");
const PROJECTS_DIR = resolve(ROOT, "docs/projects");

const BLOCKED = new Set(["lyszt", "lyszt.github.io", "the-repositorium_core"]);
const BLOCKED_SUFFIXES = ["_misc", "_edu"];

const GH_HEADERS = {
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

function formatName(repoName) {
  return repoName
    .replace(/_core$|_edu$|_legacy$/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toSlug(repoName) {
  return repoName
    .replace(/_core$|_edu$|_misc$/, "")
    .replace(/_/g, "-")
    .toLowerCase();
}

function rewriteImagePaths(readme, repoName, branch) {
  const base = `https://raw.githubusercontent.com/lyszt/${repoName}/${branch}`;
  const blob = `https://github.com/lyszt/${repoName}/blob/${branch}`;
  return readme
    .replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
      (_, alt, path) => `![${alt}](${base}/${path.replace(/^\.\//, "")})`
    )
    .replace(
      /<img([^>]*?)src=["'](?!https?:\/\/)([^"']+)["']/gi,
      (_, attrs, path) => `<img${attrs}src="${base}/${path.replace(/^\.\//, "")}"`
    )
    // Relative links would 404 (or fail rspress's dead-link check) — point
    // them at the file on GitHub instead
    .replace(
      /(?<!!)\[([^\]]*)\]\((?!https?:\/\/|#|mailto:)([^)]+)\)/g,
      (_, text, path) => `[${text}](${blob}/${path.replace(/^\.\//, "")})`
    );
}

async function fetchReadme(repoName, branch = "main") {
  try {
    const res = await fetch(
      `https://api.github.com/repos/lyszt/${repoName}/readme`,
      { headers: GH_HEADERS }
    );
    if (!res.ok) return "";
    const data = await res.json();
    const raw = Buffer.from(data.content, "base64").toString("utf8");
    return rewriteImagePaths(raw, repoName, branch);
  } catch {
    return "";
  }
}

const GITHUB_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z"/></svg>`;

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Drop the README's own H1 — the generated header already shows the title
function stripLeadingH1(md) {
  return md.replace(/^\s*#\s+[^\n]+\n?/, "");
}

function generateProjectPage(project) {
  const chips = [
    project.lang ? `<span class="project-chip">${escapeHtml(project.lang)}</span>` : "",
    project.stars > 0 ? `<span class="project-chip">★ ${project.stars}</span>` : "",
  ].filter(Boolean);

  const header = [
    `<header class="project-header glass-card">`,
    chips.length ? `  <div class="project-chips">${chips.join("")}</div>` : "",
    `  <h1 class="project-title font-title">${escapeHtml(project.name)}</h1>`,
    project.desc ? `  <p class="project-desc">${escapeHtml(project.desc)}</p>` : "",
    `  <div class="project-actions">`,
    `    <a class="project-btn project-btn-github" href="${project.url}" target="_blank" rel="noopener noreferrer">${GITHUB_ICON}View on GitHub</a>`,
    project.homepage
      ? `    <a class="project-btn" href="${escapeHtml(project.homepage)}" target="_blank" rel="noopener noreferrer">Website <span aria-hidden="true">↗</span></a>`
      : "",
    `  </div>`,
    `</header>`,
  ]
    .filter(Boolean)
    .join("\n");

  const desc = project.desc ? `\ndescription: "${project.desc.replace(/"/g, '\\"')}"` : "";

  return `---\ntitle: "${project.name}"${desc}\n---\n\n${header}\n`;
}

// --- Fetch ---
console.log("[fetch-github-repos] Fetching repo list…");

const listRes = await fetch(
  "https://api.github.com/users/lyszt/repos?per_page=100&sort=updated",
  { headers: GH_HEADERS }
);

if (!listRes.ok) {
  const body = await listRes.json().catch(() => ({}));
  const reset = listRes.headers.get("x-ratelimit-reset");
  const resetAt = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : "unknown";
  console.error(`[fetch-github-repos] GitHub ${listRes.status}: ${body.message ?? "unknown"}`);
  if (listRes.status === 403 || listRes.status === 429)
    console.error(`  Rate limit resets at ${resetAt}. Set GITHUB_TOKEN in .env for 5000 req/hr.`);
  process.exit(1);
}

const allRepos = await listRes.json();

const eligible = allRepos.filter(
  (r) =>
    !r.fork &&
    !BLOCKED.has(r.name) &&
    !BLOCKED_SUFFIXES.some((s) => r.name.endsWith(s)) &&
    (r.name.endsWith("_core") || r.name.endsWith("_legacy"))
);

console.log(`[fetch-github-repos] Fetching READMEs for ${eligible.length} repos…`);

const withReadmes = await Promise.all(
  eligible.map(async (r) => ({
    r,
    readme: await fetchReadme(r.name, r.default_branch ?? "main"),
  }))
);

// --- Build records ---
const core = [];
const legacy = [];

for (const { r, readme } of withReadmes) {
  const project = {
    slug: toSlug(r.name),
    name: formatName(r.name),
    desc: r.description || "",
    url: r.svn_url,
    homepage: r.homepage || "",
    lang: r.language || "",
    stars: r.stargazers_count,
    updatedAt: r.updated_at,
    readme,
  };

  if (!readme) continue; // skip projects with no documentation
  if (r.name.endsWith("_core")) core.push(project);
  else if (r.name.endsWith("_legacy")) legacy.push(project);
}

// --- Write JSON (without readme to keep it light) ---
mkdirSync(dirname(DATA_OUT), { recursive: true });
const dataOut = { core, legacy };
for (const list of [dataOut.core, dataOut.legacy])
  for (const p of list) delete p.readme;
writeFileSync(DATA_OUT, JSON.stringify(dataOut, null, 2));
console.log(`[fetch-github-repos] ${core.length} core, ${legacy.length} legacy → docs/data/github-repos.json`);

// --- Generate docs/projects/<slug>/index.md ---
// Only wipe generated subdirectories, preserve index.mdx
for (const entry of readdirSync(PROJECTS_DIR)) {
  const full = resolve(PROJECTS_DIR, entry);
  if (statSync(full).isDirectory()) rmSync(full, { recursive: true });
}

const all = [...core, ...legacy];
// Restore readme before generating pages
const readmeMap = Object.fromEntries(withReadmes.map(({ r, readme }) => [toSlug(r.name), readme]));

for (const project of all) {
  const dir = resolve(PROJECTS_DIR, project.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(dir, "index.md"),
    generateProjectPage({ ...project, readme: readmeMap[project.slug] ?? "" })
  );
}

console.log(`[fetch-github-repos] Generated ${all.length} project pages → docs/projects/`);
