import type { ReactNode } from 'react';
import { StatCard } from './StatCard.tsx';

export type OverviewItem = {
  label: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
};

type StatsOverviewProps = {
  items: OverviewItem[];
};

export function StatsOverview({ items }: StatsOverviewProps) {
  return (
    <section aria-label="Overview metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(item => (
        <StatCard key={item.label} {...item} />
      ))}
    </section>
  );
}
