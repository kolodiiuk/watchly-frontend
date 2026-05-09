import { ChevronRight } from 'lucide-react';

interface ContentBreadcrumbsProps {
  seriesName?: string;
}

export function ContentBreadcrumbs({ seriesName = 'Series Name' }: ContentBreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
      <span>Content</span>
      <ChevronRight className="h-3.5 w-3.5" />
      <span>{seriesName}</span>
      <ChevronRight className="h-3.5 w-3.5" />
      <span>Seasons</span>
    </nav>
  );
}
