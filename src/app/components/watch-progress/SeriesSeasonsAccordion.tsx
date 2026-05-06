import {useState} from 'react';
import {Link} from 'react-router-dom';
import type {SeasonInfo} from '../../models/SeasonInfo.tsx';

type SeriesSeasonsAccordionProps = {
  seasons: SeasonInfo[];
};

export function SeriesSeasonsAccordion({seasons}: SeriesSeasonsAccordionProps)
{
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());

  const toggleSeason = (seasonId: number) =>
  {
    const next = new Set(expandedSeasons);
    if (next.has(seasonId))
    {
      next.delete(seasonId);
    } else
    {
      next.add(seasonId);
    }
    setExpandedSeasons(next);
  };

  if (!seasons.length)
  {
    return null;
  }

  return (
    <div className="space-y-4">
      {seasons.map((season) =>
      {
        const isExpanded = expandedSeasons.has(season.seasonId);
        return (
          <section key={season.seasonId} className="overflow-hidden rounded-2xl border border-border/80 bg-background/25">
            <button type="button" onClick={() => toggleSeason(season.seasonId)} className="w-full border-b border-border/70 bg-background/35 px-5 py-4 text-left">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-text">{season.name?.trim() || `Season ${season.ordinalNumber}`}</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-muted">{season.episodes.length} ep</span>
              </div>
            </button>
            {isExpanded ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(42px,1fr))] gap-2 p-4">
                {season.episodes.map((episode, index) => (
                  <Link
                    key={episode.episodeId}
                    to={`/episode/${episode.episodeId}`}
                    className="flex aspect-square items-center justify-center rounded-lg border border-border bg-background/40 text-sm font-semibold text-text transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {index + 1}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
