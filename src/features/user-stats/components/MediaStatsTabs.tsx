import { useId, useState } from 'react';
import { MediaStatsPanel } from './MediaStatsPanel.tsx';
import type { NormalizedStats } from './statsUtils.ts';

type MediaStatsTabsProps = {
  movieStats: NormalizedStats;
  seriesStats: NormalizedStats;
};

export function MediaStatsTabs({ movieStats, seriesStats }: MediaStatsTabsProps) {
  const [activeTab, setActiveTab] = useState<'movies' | 'series'>('movies');
  const tabListId = useId();

  return (
    <section className="space-y-4" aria-labelledby={tabListId}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id={tabListId} className="text-xl font-semibold text-text">
            Media breakdown
          </h2>
          <p className="mt-1 text-sm text-muted">Move between movie and series views without repeating the same card stack.</p>
        </div>
        <div
          className="inline-flex rounded-full border border-border/80 bg-background/60 p-1 xl:hidden"
          role="tablist"
          aria-label="Media statistics views"
        >
          {(['movies', 'series'] as const).map(tab => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`media-panel-${tab}`}
                id={`media-tab-${tab}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background',
                  isActive ? 'bg-primary text-background' : 'text-muted hover:text-text',
                ].join(' ')}
              >
                {tab === 'movies' ? 'Movies' : 'Series'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden gap-4 xl:grid xl:grid-cols-2">
        <div id="media-panel-movies" role="tabpanel" aria-labelledby="media-tab-movies">
          <MediaStatsPanel mediaType="movies" stats={movieStats} />
        </div>
        <div id="media-panel-series" role="tabpanel" aria-labelledby="media-tab-series">
          <MediaStatsPanel mediaType="series" stats={seriesStats} />
        </div>
      </div>

      <div className="xl:hidden">
        <div id={`media-panel-${activeTab}`} role="tabpanel" aria-labelledby={`media-tab-${activeTab}`}>
          <MediaStatsPanel mediaType={activeTab} stats={activeTab === 'movies' ? movieStats : seriesStats} />
        </div>
      </div>
    </section>
  );
}
