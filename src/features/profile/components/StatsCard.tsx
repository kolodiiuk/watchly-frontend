import {Card} from "../../../components/common/Card";
import {Badge} from "../../../components/common/Badge";
import {Tags} from "lucide-react";
import {numberFormatter} from "../../../utils/formatters.ts";

type StatItem = {
  label: string;
  value: number;
};

type StatsCardProps = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  countItems: StatItem[];
  timeItems: StatItem[];
  topGenres: string[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
};

function StatsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-2xl border border-border/70 bg-background/45" />
      ))}
    </div>
  );
}

export function formatStatValue(value: number) {
  return numberFormatter.format(value);
}

function CountStatTile({label, value}: StatItem) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-linear-to-br from-primary/14 via-primary/6 to-background/90 p-4 shadow-[0_18px_40px_-24px_var(--color-primary)]">
      <div className="absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-primary/55 to-transparent"/>
      <div className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/80">{label}</div>
      <div className="mt-3 text-3xl font-semibold leading-none text-text">{formatStatValue(value)}</div>
    </div>
  );
}

function TimeUnitStatTile({label, value}: StatItem) {
  return (
    <div className="rounded-[1.6rem] border border-border/70 bg-background/45 p-4 backdrop-blur-sm">
      <div className="text-[0.68rem] font-medium uppercase tracking-[0.26em] text-muted">{label}</div>
      <div className="mt-2 text-2xl font-medium text-text/92">{formatStatValue(value)}</div>
    </div>
  );
}

export function StatsCard({
                            title,
                            subtitle,
                            icon: Icon,
                            countItems,
                            timeItems,
                            topGenres,
                            isLoading,
                            isError,
                            errorMessage
                          }: StatsCardProps)
{
  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
            <Icon className="h-5 w-5 text-primary"/>
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
      </div>

      {isLoading ? (
        <StatsSkeleton/>
      ) : isError ? (
        <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
          {errorMessage}
        </div>
      ) : (
        <>
          {countItems.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {countItems.map(item => (
                <CountStatTile key={item.label} {...item} />
              ))}
            </div>
          ) : null}

          {timeItems.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {timeItems.map(item => (
                <TimeUnitStatTile key={item.label} {...item} />
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center gap-2 text-sm font-medium text-muted">
              <Tags className="h-4 w-4"/>
              Top genres
            </div>
            {topGenres.length > 0 ? (
              topGenres.map(genre => (
                <Badge key={genre} tone="default" className="tracking-normal normal-case">
                  {genre}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted">No genre data yet.</span>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
