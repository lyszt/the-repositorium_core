import { writeFileSync, readFileSync, mkdirSync, rmSync, readdirSync, statSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { generateProjectPage, stripLeadingH1 } from "./lib/project-page.mjs";

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
    (r.name.endsWith("_core") || r.name.endsWith("_legacy") || r.name.endsWith("_phare"))
);

console.log(`[fetch-github-repos] Fetching READMEs for ${eligible.length} repos…`);

const withReadmes = await Promise.all(
  eligible.map(async (r) => ({
    r,
    readme: await fetchReadme(r.name, r.default_branch ?? "main"),
  }))
);

// --- Build records ---
const phare = [];
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
  if (r.name.endsWith("_phare")) phare.push(project);
  else if (r.name.endsWith("_legacy")) legacy.push(project);
  else core.push(project);
}

// --- Write JSON (without readme to keep it light) ---
mkdirSync(dirname(DATA_OUT), { recursive: true });
const dataOut = { phare, core, legacy };
for (const list of [dataOut.phare, dataOut.core, dataOut.legacy])
  for (const p of list) delete p.readme;
writeFileSync(DATA_OUT, JSON.stringify(dataOut, null, 2));
console.log(`[fetch-github-repos] ${phare.length} phare, ${core.length} core, ${legacy.length} legacy → docs/data/github-repos.json`);

// --- Generate docs/projects/<slug>/index.md ---
// Clean only the files this script generates. Manually-added docs (extra .md
// pages and the optional _extra.json sidebar manifest) living in a .generated
// project dir are preserved across regeneration.
const GENERATED_FILES = ["index.md", "readme.md"];
for (const entry of readdirSync(PROJECTS_DIR)) {
  const full = resolve(PROJECTS_DIR, entry);
  if (statSync(full).isDirectory() && existsSync(resolve(full, ".generated"))) {
    for (const f of GENERATED_FILES) {
      const fp = resolve(full, f);
      if (existsSync(fp)) rmSync(fp);
    }
  }
}

const all = [...phare, ...core, ...legacy];
// Restore readme before generating pages
const readmeMap = Object.fromEntries(withReadmes.map(({ r, readme }) => [toSlug(r.name), readme]));

const sidebar = {};

for (const project of all) {
  const dir = resolve(PROJECTS_DIR, project.slug);
  const readme = readmeMap[project.slug] ?? "";
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, ".generated"), "");
  writeFileSync(resolve(dir, "index.md"), generateProjectPage(project));

  const sidebarItems = [
    { text: "← Projects", link: "/projects/" },
    { text: "Overview", link: `/projects/${project.slug}/` },
  ];

  if (readme) {
    writeFileSync(
      resolve(dir, "readme.md"),
      `---\ntitle: "README"\n---\n\n${stripLeadingH1(readme)}`
    );
    sidebarItems.push({ text: "README", link: `/projects/${project.slug}/readme` });
  }

  // Append manually-curated pages preserved across regen. A project may ship a
  // docs/projects/<slug>/_extra.json: [{ "text": "Guide", "link": "/projects/<slug>/guide" }]
  const extraPath = resolve(dir, "_extra.json");
  if (existsSync(extraPath)) {
    try {
      const extra = JSON.parse(readFileSync(extraPath, "utf8"));
      if (Array.isArray(extra)) sidebarItems.push(...extra);
    } catch (e) {
      console.warn(`[fetch-github-repos] Ignoring bad _extra.json for ${project.slug}: ${e.message}`);
    }
  }

  sidebar[`/projects/${project.slug}/`] = sidebarItems;
}

// --- Write sidebar config ---
writeFileSync(resolve(ROOT, "docs/data/sidebar.json"), JSON.stringify(sidebar, null, 2));

console.log(`[fetch-github-repos] Generated ${all.length} project pages → docs/projects/`);
