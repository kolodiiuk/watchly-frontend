export function MovieFieldsSection() {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-background/30 p-4">
      <h3 className="text-sm font-semibold text-text">Movie-specific fields</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Budget (optional)" />
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Box office (optional)" />
      </div>
      <p className="text-xs text-muted">Validation stub: use numeric and non-negative checks in logic layer.</p>
    </section>
  );
}
