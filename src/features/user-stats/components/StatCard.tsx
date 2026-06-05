import type { ReactNode } from 'react';
import { Card } from '../../../components/common/Card.tsx';

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  subtitle?: string;
};

export function StatCard({ icon, label, value, subtitle }: StatCardProps) {
  return (
    <Card
      tone="raised"
      className="relative overflow-hidden border-border/80 bg-linear-to-br from-surface-raised via-surface to-background-alt p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]"
    >
      <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold leading-none text-text">{value}</p>
          {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </Card>
  );
}
