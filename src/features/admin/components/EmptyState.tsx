import { Film } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-surface/50 p-10 text-center">
      <Film className="mx-auto h-8 w-8 text-muted" />
      <h3 className="mt-3 text-base font-semibold text-text">No titles yet</h3>
      <p className="mt-1 text-sm text-muted">Create a title to start managing movies and TV shows.</p>
    </div>
  );
}
