import { Badge } from '../../components/ui/Badge';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Card } from '../../components/ui/Card';

const collections = [
  { title: 'Award season', detail: 'Best picture contenders and festival favorites', tone: 'accent' as const },
  { title: 'Late-night sci-fi', detail: 'Moody, cerebral, and visually dense picks', tone: 'warning' as const },
  { title: 'Weekend crowd-pleasers', detail: 'Easy watch options with strong rewatch value', tone: 'success' as const },
];

export function BrowsePage() {
  return (
    <div className="space-y-6">
      <Card tone="raised">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Browse</p>
            <h1 className="mt-2 text-3xl font-semibold text-text">Open catalog</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Public discovery surface for the app. Search, collections, and movie detail routes can be expanded here
              without changing the authenticated shell.
            </p>
          </div>
          <ButtonLink to="/auth/sign-up">Save preferences</ButtonLink>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {collections.map(collection => (
          <Card key={collection.title}>
            <Badge tone={collection.tone}>{collection.title}</Badge>
            <p className="mt-4 text-sm leading-6 text-muted">{collection.detail}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
