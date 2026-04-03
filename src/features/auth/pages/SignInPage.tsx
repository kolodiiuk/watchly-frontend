import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import { useAuth } from '../services/AuthProvider.tsx';
import { createDemoUser } from '../services/authStorage.ts';
import { UserRole } from '../../../app/models/UserRole.ts';

type LocationState = {
  from?: string;
};

export function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [email, setEmail] = useState('jane@example.com');
  const [password, setPassword] = useState('Password1');
  const [error, setError] = useState<string | null>(null);

  const redirectTo = state?.from ?? '/dashboard';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    signIn(createDemoUser(email.trim(), email.split('@')[0] || 'Viewer'));
    navigate(redirectTo, { replace: true });
  };

  const handleDemoAdmin = () => {
    signIn(createDemoUser('admin@watchly.local', 'Admin', UserRole.ADMIN));
    navigate('/admin', { replace: true });
  };

  return (
    <Card tone="raised">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted">Sign in</p>
          <h1 className="mt-2 text-3xl font-semibold text-text">Welcome back</h1>
        </div>
        <Badge tone="accent">Protected routes</Badge>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm text-muted">Email</span>
          <input
            className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-text outline-none ring-0 focus:border-primary"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-muted">Password</span>
          <input
            className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-text outline-none ring-0 focus:border-primary"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit">Sign in</Button>
          <Button type="button" variant="secondary" onClick={handleDemoAdmin}>
            Demo admin
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted">
        No account yet?{' '}
        <Link className="text-accent hover:underline" to="/auth/sign-up">
          Create one
        </Link>
      </p>
    </Card>
  );
}
