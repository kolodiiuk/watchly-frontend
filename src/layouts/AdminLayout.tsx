import { Link, NavLink, Outlet } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../features/auth/services/AuthProvider.tsx';
import { UserRole } from '../features/auth/models/UserRole';

export function AdminLayout() {
  const { user, signOut, role } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/80 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-warning font-black text-background">
              A
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-text">Admin</div>
            </div>
          </Link>

          <nav className="order-3 flex w-full rounded-xl border border-border bg-background/40 p-1 sm:order-none sm:w-auto">
            <NavLink
              to="/admin/movies"
              className={({ isActive }) =>
                `flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors sm:flex-none ${
                  isActive ? 'bg-warning text-background' : 'text-muted hover:bg-white/5 hover:text-text'
                }`
              }>
              Movies
            </NavLink>
            <NavLink
              to="/admin/series"
              className={({ isActive }) =>
                `flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors sm:flex-none ${
                  isActive ? 'bg-warning text-background' : 'text-muted hover:bg-white/5 hover:text-text'
                }`
              }>
              TV Series
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-text">{user?.displayName}</div>
              <Badge className="mt-1" tone="warning">
                {role === UserRole.ADMIN ? 'admin' : 'unknown'}
              </Badge>
            </div>
            <Button variant="secondary" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
