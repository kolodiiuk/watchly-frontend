import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { TitlesToolbar } from '../../../components/admin/content/TitlesToolbar';
import { TitlesTable } from '../../../components/admin/content/TitlesTable';
import { TitleFormModal } from '../../../components/admin/content/TitleFormModal';
import { LoadingState } from '../../../components/admin/content/LoadingState';
import { EmptyState } from '../../../components/admin/content/EmptyState';
import { SeriesStructurePanel } from '../../../components/admin/content/SeriesStructurePanel';
import { SeasonFormModal } from '../../../components/admin/content/SeasonFormModal';
import { EpisodeFormModal } from '../../../components/admin/content/EpisodeFormModal';
import { ConfirmDeleteDialog } from '../../../components/admin/content/ConfirmDeleteDialog';
import { InlineErrorNotice } from '../../../components/admin/content/InlineErrorNotice';
import { InlineSuccessNotice } from '../../../components/admin/content/InlineSuccessNotice';
import { ContentBreadcrumbs } from '../../../components/admin/content/ContentBreadcrumbs';
import { SelectedTitleSummaryCard } from '../../../components/admin/content/SelectedTitleSummaryCard';
import { UnauthorizedFallback } from '../../../components/admin/content/UnauthorizedFallback';
import { UserRole } from '../../models/UserRole';
import { useAuth } from '../../../features/auth/services/AuthProvider';
import type { AdminSeasonRow, AdminTitleRow } from '../../../components/admin/content/types';

const demoTitles: AdminTitleRow[] = [
  { id: 1, name: 'The Silent Signal', type: 'movie', releaseDate: '2024-01-12', rating: 7.3 },
  { id: 2, name: 'North Harbor', type: 'series', releaseDate: '2025-09-01', rating: 8.1 },
];

const demoSeasons: AdminSeasonRow[] = [
  {
    id: 1,
    ordinalNumber: 1,
    name: 'Season One',
    episodesCount: 2,
    episodes: [
      { id: 1, ordinalNumber: 1, name: 'Pilot', runtime: 51, releaseDate: '2025-09-01', overview: 'Stub overview.' },
      { id: 2, ordinalNumber: 2, name: 'Aftermath', runtime: 49, releaseDate: '2025-09-08', overview: 'Stub overview.' },
    ],
  },
];

export function AdminContentPage() {
  const { role } = useAuth();
  const isAdmin = role === UserRole.USER;

  if (!isAdmin) {
    return <UnauthorizedFallback />;
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/70 p-4">
        <div>
          <h1 className="text-xl font-semibold text-text">Admin Content</h1>
          <p className="text-sm text-muted">Manage movies, TV shows, seasons, and episodes.</p>
        </div>
        <Button leadingIcon={<Plus className="h-4 w-4" />}>Create title</Button>
      </header>

      <TitlesToolbar />
      <InlineSuccessNotice />
      <InlineErrorNotice />

      <section className="space-y-3">
        <TitlesTable rows={demoTitles} />
        <LoadingState />
        <EmptyState />
      </section>

      <ContentBreadcrumbs seriesName="North Harbor" />
      <SelectedTitleSummaryCard name="North Harbor" type="series" />
      <SeriesStructurePanel titleName="North Harbor" seasons={demoSeasons} />

      <TitleFormModal isOpen={false} mode="create" />
      <SeasonFormModal isOpen={false} mode="create" />
      <EpisodeFormModal isOpen={false} mode="create" />
      <ConfirmDeleteDialog isOpen={false} targetType="title" />
    </div>
  );
}
