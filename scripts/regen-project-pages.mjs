// Regenerate per-project index.md headers from the cached repo JSON — no network.
// Use after editing the header template in lib/project-page.mjs to refresh pages
// without re-hitting the GitHub API. README pages (readme.md) are left untouched.

import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { generateProjectPage } from "./lib/project-page.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA = resolve(ROOT, "docs/data/github-repos.json");
const PROJECTS_DIR = resolve(ROOT, "docs/projects");

const { phare = [], core = [], legacy = [] } = JSON.parse(readFileSync(DATA, "utf8"));
const all = [...phare, ...core, ...legacy];

let written = 0;
for (const project of all) {
  const dir = resolve(PROJECTS_DIR, project.slug);
  if (!existsSync(dir)) continue;
  // Only rewrite generated dirs. Hand-written project pages (manual archive
  // projects) carry no .generated marker and must be left untouched.
  if (!existsSync(resolve(dir, ".generated"))) continue;
  writeFileSync(resolve(dir, "index.md"), generateProjectPage(project));
  written++;
}

console.log(`[regen-project-pages] Rewrote ${written} project headers → docs/projects/`);
