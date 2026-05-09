export function TitleMetaFields() {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-text">Metadata</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Genres" />
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Languages" />
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Production companies" />
      </div>
      <p className="text-xs text-muted">Stub input: final implementation can use tokenized multi-select controls.</p>
    </section>
  );
}
