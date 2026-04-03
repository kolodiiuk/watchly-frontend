import { Link, NavLink, Outlet } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ButtonLink } from '../ui/ButtonLink';
import { useAuth } from '../../features/auth/services/AuthProvider.tsx';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-white/10 text-text' : 'text-muted hover:bg-white/5 hover:text-text',
  ].join(' ');

export function MainLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/70 bg-background/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-background font-black">
              W
            </span>
            <div>
              <div className="font-semibold text-text">Watchly</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/browse" className={navLinkClass}>
              Browse
            </NavLink>
            <NavLink to="/watchlist" className={navLinkClass}>
              Watchlist
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Badge tone="accent">{user.displayName}</Badge>
                <Button variant="secondary" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <ButtonLink to="/auth/sign-in" variant="secondary">
                  Sign in
                </ButtonLink>
                <ButtonLink to="/auth/sign-up">Create account</ButtonLink>
              </>
            )}
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
