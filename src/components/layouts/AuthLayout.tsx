import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-background font-black">
              W
            </span>
            <div>
              <div className="font-semibold text-text">Watchly</div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted">Secure session entry</div>
            </div>
          </Link>

          <Outlet />
        </div>
      </div>
    </main>
  );
}
