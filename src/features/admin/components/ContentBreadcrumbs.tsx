import { ChevronRight } from 'lucide-react';

interface ContentBreadcrumbsProps {
  titleName?: string;
  showSeasonsTrail?: boolean;
}

export function ContentBreadcrumbs({ titleName = 'Selected title', showSeasonsTrail = false }: ContentBreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
      <span>Content</span>
      <ChevronRight className="h-3.5 w-3.5" />
      <span>{titleName}</span>
      {showSeasonsTrail ? (
        <>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Seasons</span>
        </>
      ) : null}
    </nav>
  );
}
