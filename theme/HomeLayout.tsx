import reposData from '../docs/data/github-repos.json';

type Project = { slug: string; name: string; desc: string; lang: string };

function pickRandom(arr: Project[], n: number): Project[] {
  return [...arr]
    .filter((p) => p.name && p.desc)
    .sort(() => Math.random() - 0.5)
    .slice(0, n);
}

const featured = pickRandom(reposData.core as Project[], 3);

export default function HomeLayout() {
  return (
    <section className="animate-fade-in">

      {/* Hero */}
      <div className="bg-background px-[10%] py-[8%] flex flex-col md:flex-row gap-10 md:gap-16 items-start border-b border-border">
        <div className="flex flex-col gap-8 flex-1">
          <span className="text-sm tracking-widest text-muted-foreground font-light">The Repositorium</span>
          <h1 className="font-title text-4xl md:text-6xl font-extrabold leading-tight text-foreground">
            Documentation &amp; technical writings.
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl">
            A reference for projects built under LYSZT — spanning systems software, web applications,
            developer tools, and learning resources.
          </p>
        </div>
      </div>

      {/* What's here */}
      <div className="bg-surface px-[10%] py-[8%] flex flex-col gap-14">
        <div className="flex flex-col gap-4">
          <span className="text-sm tracking-widest text-muted-foreground">What's here</span>
          <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed max-w-3xl">
            Most of what is documented here supports tools built to help people using technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-foreground">Documentation</h3>
            <p className="text-muted-foreground leading-relaxed">
              Architecture, implementation decisions, and usage guides for active projects.
              Covers how things are built and why specific choices were made.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-foreground">Dev logs</h3>
            <p className="text-muted-foreground leading-relaxed">
              Informal notes, experiments, and observations accumulated while building.
              Less structured than documentation, more honest about the process.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-foreground">Learning tools</h3>
            <p className="text-muted-foreground leading-relaxed">
              References and guides for developer tools aimed at CS students — RISC-V simulation,
              number systems, academic writing, CS concepts and more.
            </p>
          </div>
        </div>
      </div>

      {/* Featured projects */}
      {featured.length > 0 && (
        <div className="bg-background px-[10%] py-[8%] border-t border-border flex flex-col gap-8">
          <span className="text-sm tracking-widest text-muted-foreground">Projects</span>
          <p className="text-foreground text-xl md:text-2xl font-bold leading-relaxed max-w-2xl">
            Open source, documented work.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Projects are built and maintained at various stages — from early experiments to
            actively used tools. Each is released publicly as it reaches some level of maturity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {featured.map((p) => (
              <a
                key={p.slug}
                href={`/projects/${p.slug}/`}
                className="glass-card group p-6 flex flex-col gap-3 no-underline"
              >
                {p.lang && (
                  <span className="text-xs tracking-widest text-muted-foreground">{p.lang}</span>
                )}
                <h3 className="text-base font-bold text-foreground">{p.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{p.desc}</p>
                <span className="mt-auto text-sm text-muted-foreground group-hover:text-[var(--cyan)] transition-colors">
                  View docs →
                </span>
              </a>
            ))}
          </div>

          <a
            href="/projects/"
            className="w-fit px-6 py-4 bg-foreground text-background text-sm font-medium hover:bg-foreground-hover transition-colors no-underline"
          >
            All projects →
          </a>
        </div>
      )}

    </section>
  );
}
