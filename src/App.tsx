import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { useMovieTheme } from './theme/MovieThemeProvider';

const continueWatching = [
  {
    title: 'Dune: Part Two',
    detail: 'Runtime 2h 46m',
    progress: 74,
    accent: 'accent',
  },
  {
    title: 'Poor Things',
    detail: 'Runtime 2h 21m',
    progress: 42,
    accent: 'warning',
  },
  {
    title: 'Oppenheimer',
    detail: 'Runtime 3h 0m',
    progress: 91,
    accent: 'success',
  },
] as const;

const watchlist = [
  {
    title: 'The Batman',
    meta: 'Thriller, 2022',
    status: 'Queued for Friday night',
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    meta: 'Animation, 2023',
    status: 'High priority',
  },
  {
    title: 'Arrival',
    meta: 'Sci-fi, 2016',
    status: 'Rewatch planned',
  },
] as const;

const stats = [
  { label: 'Tracked titles', value: '1,284' },
  { label: 'This month', value: '18' },
  { label: 'Watch streak', value: '12 days' },
  { label: 'Average rating', value: '8.6' },
] as const;

function App() {
  const { theme } = useMovieTheme();

  return (
    <main className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(245,196,81,0.12),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(99,215,207,0.12),_transparent_28%),linear-gradient(180deg,_var(--movie-background),_var(--movie-background-alt))]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card tone="glass" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,196,81,0.15),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(99,215,207,0.12),_transparent_34%)]" />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="accent">{theme.label}</Badge>
                <span className="text-sm text-muted">Dark theme, parameterized tokens, Tailwind utilities</span>
              </div>

              <div className="max-w-2xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent">Watchly</p>
                <h1 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                  Track what you watch with a cinematic dark interface.
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted">
                  A theme-ready movie dashboard with CSS variable color tokens, Tailwind-styled components, and a
                  palette tuned for long viewing sessions.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button leadingIcon={<span aria-hidden="true">▶</span>}>Continue watching</Button>
                <Button variant="secondary">Open watchlist</Button>
                <Button variant="ghost">Edit theme colors</Button>
              </div>
            </div>
          </Card>

          <Card tone="raised" className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">Current mood</p>
              <h2 className="mt-2 text-2xl font-semibold text-text">Midnight cinema</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Primary gold highlights, teal accents, slate surfaces, and a soft red alert tone for ratings and misses.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map(stat => (
                <div key={stat.label} className="rounded-2xl border border-border bg-background/35 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-text">{stat.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted">Now watching</p>
                <h2 className="mt-2 text-2xl font-semibold text-text">Continue the queue</h2>
              </div>
              <Badge tone="warning">3 titles</Badge>
            </div>

            <div className="mt-6 space-y-4">
              {continueWatching.map(movie => (
                <div key={movie.title} className="rounded-2xl border border-border/80 bg-background/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-text">{movie.title}</div>
                      <div className="text-sm text-muted">{movie.detail}</div>
                    </div>
                    <Badge tone={movie.accent}>{movie.progress}%</Badge>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary via-primary-strong to-accent"
                      style={{ width: `${movie.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted">Watchlist</p>
                <h2 className="mt-2 text-2xl font-semibold text-text">Next up</h2>
              </div>
              <Badge tone="success">Curated</Badge>
            </div>

            <div className="mt-6 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80">
              {watchlist.map(movie => (
                <div
                  key={movie.title}
                  className="flex flex-col gap-2 bg-background/25 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-text">{movie.title}</div>
                    <div className="text-sm text-muted">{movie.meta}</div>
                  </div>
                  <span className="text-sm text-accent">{movie.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default App;
