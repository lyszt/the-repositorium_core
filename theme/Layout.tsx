import { useLocation } from '@rspress/core/runtime';
import { Layout as OriginalLayout } from '@rspress/core/theme-original';
import type { LayoutProps } from '@rspress/core/theme';

const SPONSOR_GH = 'https://github.com/sponsors/lyszt';

function SponsorCard() {
  return (
    <div className="rp-sponsor-card">
      <div className="rp-sponsor-card__body">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 14.25s-5.5-3.5-5.5-7a3.5 3.5 0 0 1 6.5-1.73A3.5 3.5 0 0 1 13.5 7c0 3.5-5.5 7-5.5 7Z" />
        </svg>
        <div className="rp-sponsor-card__text">
          <strong>Support this project</strong>
          <span>Your sponsorship helps maintain and improve the tools documented here.</span>
        </div>
      </div>
      <a
        className="rp-sponsor-card__action"
        href={SPONSOR_GH}
        target="_blank"
        rel="noopener noreferrer"
      >
        Sponsor
        <span aria-hidden="true">&nbsp;&#8599;</span>
      </a>
    </div>
  );
}

export default function Layout(props: LayoutProps) {
  const { pathname } = useLocation();
  const isProjectPage = pathname.startsWith('/projects/');

  if (!isProjectPage) {
    return <OriginalLayout {...props} />;
  }

  return (
    <OriginalLayout
      {...props}
      afterDocContent={
        <>
          {props.afterDocContent}
          <SponsorCard />
        </>
      }
    />
  );
}
