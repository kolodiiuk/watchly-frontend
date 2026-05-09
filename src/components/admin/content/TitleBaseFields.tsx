export function TitleBaseFields() {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-text">Base fields</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Name" />
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Poster URL" />
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Release date" />
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Runtime (minutes)" />
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Tagline" />
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm" placeholder="Director" />
        <input className="rounded-xl border border-border bg-background/50 px-3 py-2 text-sm md:col-span-2" placeholder="Actors (comma separated)" />
        <textarea className="min-h-24 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm md:col-span-2" placeholder="Overview" />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-text">
        <input type="checkbox" className="h-4 w-4 rounded border-border bg-background/50" />
        Adult content
      </label>
    </section>
  );
}
