import reposData from '../../docs/data/github-repos.json';

type Project = {
  slug: string;
  name: string;
  desc: string;
  url: string;
  homepage: string;
  lang: string;
  stars: number;
  updatedAt: string;
};

const { phare, core, legacy } = reposData as {
  phare: Project[];
  core: Project[];
  legacy: Project[];
};

const total = phare.length + core.length + legacy.length;

function formatYear(iso: string): string {
  const y = new Date(iso).getFullYear();
  return Number.isNaN(y) ? '' : String(y);
}

/* Phare entry — featured project, visually distinct from regular entries. */
function PhareEntry({ p, delay }: { p: Project; delay: number }) {
  const year = formatYear(p.updatedAt);

  return (
    <a
      href={`/projects/${p.slug}/`}
      style={{ animationDelay: `${delay}ms` }}
      className="phare-entry group lux-rise flex flex-col gap-3 no-underline
                 border border-border rounded-sm p-6 md:p-8
                 transition-[background,border-color] duration-300
                 hover:bg-[color-mix(in_oklch,var(--foreground)_4%,transparent)]
                 hover:border-[color-mix(in_oklch,var(--foreground)_30%,transparent)]"
    >
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

      <h3 className="font-display text-3xl md:text-4xl leading-[1.1] text-foreground m-0
                     transition-colors duration-200">
        {p.name}
        <span aria-hidden className="entry-arrow inline-block ml-3 align-middle text-xl
                                     opacity-0 -translate-x-1 transition-all duration-300
                                     group-hover:opacity-100 group-hover:translate-x-0
                                     text-[var(--rp-c-brand)]">
          →
        </span>
      </h3>

      {p.desc && (
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground m-0 max-w-2xl">
          {p.desc}
        </p>
      )}
    </a>
  );
}

/* A single index entry — reads like a line in a printed table of contents. */
function Entry({ p, n, delay }: { p: Project; n: number; delay: number }) {
  const num = String(n).padStart(2, '0');
  const year = formatYear(p.updatedAt);

  return (
    <a
      href={`/projects/${p.slug}/`}
      style={{ animationDelay: `${delay}ms` }}
      className="entry group lux-rise grid grid-cols-[2.25rem_1fr] md:grid-cols-[3.5rem_1fr_9rem]
                 items-baseline gap-x-4 gap-y-1.5 no-underline
                 border-t border-border py-6 md:py-7
                 transition-[background,padding] duration-300
                 hover:bg-[color-mix(in_oklch,var(--foreground)_3%,transparent)]
                 md:hover:pl-4"
    >
      {/* Index numeral */}
      <span className="font-mono text-xs tracking-[0.1em] text-muted-foreground/70 tabular-nums pt-1.5">
        {num}
      </span>

      {/* Title + description */}
      <div className="min-w-0">
        <h3 className="entry-title font-display text-2xl md:text-[1.75rem] leading-[1.15] text-foreground m-0
                       transition-colors duration-200">
          {p.name}
          <span aria-hidden className="entry-arrow inline-block ml-2 align-middle text-base
                                       opacity-0 -translate-x-1 transition-all duration-300
                                       group-hover:opacity-100 group-hover:translate-x-0
                                       text-[var(--rp-c-brand)]">
            →
          </span>
        </h3>
        {p.desc && (
          <p className="text-sm md:text-[0.9375rem] leading-relaxed text-muted-foreground mt-2 mb-0
                        max-w-2xl line-clamp-2">
            {p.desc}
          </p>
        )}

        {/* Metadata — inline on mobile, hidden here on desktop (shown in 3rd column) */}
        <div className="flex md:hidden items-center gap-3 mt-3 text-[0.6875rem] font-mono
                        tracking-[0.08em] text-muted-foreground/80">
          {p.lang && <span>{p.lang}</span>}
          {p.stars > 0 && <span>★ {p.stars}</span>}
          {year && <span className="ml-auto">{year}</span>}
        </div>
      </div>

      {/* Metadata column — desktop only, right-aligned like a page number */}
      <div className="hidden md:flex flex-col items-end gap-1.5 text-right pt-1.5">
        {p.lang && (
          <span className="font-mono text-[0.6875rem] tracking-[0.08em] text-muted-foreground">
            {p.lang}
          </span>
        )}
        <div className="flex items-center gap-2 text-[0.6875rem] font-mono tracking-[0.08em]
                        text-muted-foreground/70">
          {p.stars > 0 && <span>★ {p.stars}</span>}
          {year && <span>{year}</span>}
        </div>
      </div>
    </a>
  );
}

function Section({
  label,
  index,
  projects,
  startDelay,
}: {
  label: string;
  index: string;
  projects: Project[];
  startDelay: number;
}) {
  if (projects.length === 0) return null;
  return (
    <section className="mt-16 first:mt-0">
      <header className="flex items-baseline justify-between mb-1">
        <h2 className="font-mono text-[0.6875rem] font-medium tracking-[0.22em] uppercase
                       text-muted-foreground m-0">
          <span className="text-foreground">{index}</span>
          <span className="mx-2 text-muted-foreground/40">/</span>
          {label}
        </h2>
        <span className="font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground/60">
          {String(projects.length).padStart(2, '0')}
        </span>
      </header>
      <div className="border-b border-border">
        {projects.map((p, i) => (
          <Entry key={p.slug} p={p} n={i + 1} delay={startDelay + i * 45} />
        ))}
      </div>
    </section>
  );
}

export default function ProjectsList() {
  return (
    <div className="rp-not-doc projects-index">
      {/* Masthead */}
      <header className="border-b border-border pb-10 mb-4">
        <div className="flex items-center justify-between font-mono text-[0.6875rem]
                        tracking-[0.22em] uppercase text-muted-foreground mb-8">
          <span>The Repositorium — Index</span>
          <span className="tabular-nums">{String(total).padStart(2, '0')} entries</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] text-foreground m-0">
          Projects
        </h1>

        <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
          A working catalogue of open-source software built under LYSZT — systems utilities,
          web applications, language tooling, and the quieter experiments in between.
        </p>
      </header>

      {phare.length > 0 && (
        <section className="mt-16 first:mt-0">
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="font-mono text-[0.6875rem] font-medium tracking-[0.22em] uppercase
                           text-muted-foreground m-0">
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
    </div>
  );
}
