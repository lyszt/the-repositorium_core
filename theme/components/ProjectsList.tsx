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

const { core, legacy } = reposData as {
  core: Project[];
  legacy: Project[];
};

function ProjectCard({ p }: { p: Project }) {
  return (
    <a
      href={`/projects/${p.slug}/`}
      className="glass-card block px-5 py-4 no-underline group transition-all"
    >
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-sans font-semibold text-sm text-foreground group-hover:text-[var(--cyan)] transition-colors">
          {p.name}
        </span>
        {p.lang && (
          <span className="text-[0.6875rem] font-mono text-muted-foreground ml-3 shrink-0">
            {p.lang}
          </span>
        )}
      </div>
      {p.desc && (
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
          {p.desc}
        </p>
      )}
    </a>
  );
}

function Section({ label, projects }: { label: string; projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section className="mb-12">
      {label && (
        <h2 className="text-[0.6875rem] font-semibold tracking-[0.12em] text-muted-foreground mb-5">
          {label}
        </h2>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.slug} p={p} />
        ))}
      </div>
    </section>
  );
}

export default function ProjectsList() {
  return (
    <>
      <Section label="" projects={core} />
      <Section label="Legacy" projects={legacy} />
    </>
  );
}
