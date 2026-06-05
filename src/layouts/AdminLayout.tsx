import { Link, NavLink, Outlet } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../features/auth/services/AuthProvider.tsx';
import { UserRole } from '../features/auth/models/UserRole';

const adminNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-2xl px-4 py-3 text-sm transition-colors',
    isActive ? 'bg-warning/15 text-warning' : 'text-muted hover:bg-white/5 hover:text-text',
  ].join(' ');

export function AdminLayout() {
  const { user, signOut, role } = useAuth();

  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-10">
      <aside className="rounded-3xl border border-border/80 bg-surface/80 p-4 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 px-2 py-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning text-background font-black">
            A
          </span>
          <div>
            <div className="font-semibold text-text">Admin</div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted">Content operations</div>
          </div>
        </Link>

        <div className="mt-5 space-y-2">
          <NavLink to="/admin" end className={adminNavClass}>
            Overview
          </NavLink>
          <NavLink to="/admin/users" className={adminNavClass}>
            Users
          </NavLink>
          <NavLink to="/admin/content" className={adminNavClass}>
            Content
          </NavLink>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-background/35 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-muted">Signed in as</div>
          <div className="mt-2 font-semibold text-text">{user?.displayName}</div>
          <Badge className="mt-3" tone="warning">
            {role === UserRole.ADMIN ? 'pages' : 'unknown'}
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
