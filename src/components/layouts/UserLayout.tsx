import { Link, NavLink, Outlet } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../features/auth/services/AuthProvider.tsx';

const appNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-2xl px-4 py-3 text-sm transition-colors',
    isActive ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-white/5 hover:text-text',
  ].join(' ');

export function UserLayout() {
  const { user, signOut, role } = useAuth();

  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-10">
      <aside className="rounded-3xl border border-border/80 bg-surface/70 p-4 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 px-2 py-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-background font-black">
            W
          </span>
          <div>
            <div className="font-semibold text-text">Watchly</div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted">Personal space</div>
          </div>
        </Link>

        <div className="mt-5 space-y-2">
          <NavLink to="/dashboard" className={appNavClass}>
            Dashboard
          </NavLink>
          <NavLink to="/profile" className={appNavClass}>
            Profile
          </NavLink>
          <NavLink to="/browse" className={appNavClass}>
            Browse
          </NavLink>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-background/35 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-muted">Signed in as</div>
          <div className="mt-2 font-semibold text-text">{user?.displayName}</div>
          <div className="text-sm text-muted">{user?.email}</div>
          <Badge className="mt-3" tone="accent">
            {role ?? user?.userRoles?.[0] ?? 'unknown'}
          </Badge>
        </div>

        <Button className="mt-4 w-full" variant="secondary" onClick={() => void signOut()}>
          Sign out
        </Button>
      </aside>

      <section className="space-y-6">
        <Outlet />
      </section>
    </div>
  );
}
