import { Link, NavLink, Outlet } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';
import { useAuth } from '../features/auth/services/AuthProvider.tsx';
import {UserRole} from "../features/auth/models/UserRole.ts";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-white/10 text-text' : 'text-muted hover:bg-white/5 hover:text-text',
  ].join(' ');

export function MainLayout() {
  const { user, signOut } = useAuth();
  const handleSignOut = () => {
    void signOut();
  };

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

          <div className="flex items-center gap-3">
            {user ? ( user.role == UserRole.USER ? (
              <>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
                <Button variant="secondary" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
              ) : (
                <>
                  <NavLink to="/admin/content" className={navLinkClass}>
                    Profile
                  </NavLink>
                  <Button variant="secondary" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </>
              )
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
