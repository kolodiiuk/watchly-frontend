import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuth } from '../features/auth/services/AuthProvider.tsx';

const appNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-2xl px-4 py-3 text-sm transition-colors',
    isActive ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-white/5 hover:text-text',
  ].join(' ');

export function UserLayout() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg border border-border p-2 text-muted hover:bg-white/5 hover:text-text lg:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-background font-black">
                W
              </span>
              <div className="font-semibold text-text">Watchly</div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text">{user?.displayName}</span>
            <Button variant="secondary" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex gap-6">
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 transform border-border/80 bg-surface/70 p-4 backdrop-blur-xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <nav className="space-y-2">
              <NavLink to="/profile" className={appNavClass} onClick={() => setSidebarOpen(false)}>
                Profile
              </NavLink>
              <NavLink to="/watchlists" className={appNavClass} onClick={() => setSidebarOpen(false)}>
                Watch Lists
              </NavLink>
              <NavLink to="/stats" className={appNavClass} onClick={() => setSidebarOpen(false)}>
                Stats
              </NavLink>
            </nav>
          </aside>

          {sidebarOpen && (
            <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <section className="flex-1 space-y-6">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
