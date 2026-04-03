import { ButtonLink } from '../components/ui/ButtonLink.tsx';
import { Card } from '../components/ui/Card.tsx';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-10">
      <Card tone="raised" className="w-full text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Page not found</h1>
        <p className="mt-3 text-sm text-muted">The route you asked for does not exist in this app shell.</p>
        <div className="mt-6 flex justify-center">
          <ButtonLink to="/">Back home</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
