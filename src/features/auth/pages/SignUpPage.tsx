import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import { useAuth } from '../services/AuthProvider.tsx';
import { createDemoUser } from '../services/authStorage.ts';

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('Jane');
  const [email, setEmail] = useState('jane@example.com');
  const [password, setPassword] = useState('Password1');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError('Display name, email, and password are required.');
      return;
    }

    signUp(createDemoUser(email.trim(), displayName.trim()));
    navigate('/dashboard', { replace: true });
  };

  return (
    <Card tone="raised">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted">Sign up</p>
          <h1 className="mt-2 text-3xl font-semibold text-text">Create your account</h1>
        </div>
        <Badge tone="success">Local session</Badge>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm text-muted">Display name</span>
          <input
            className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-text outline-none ring-0 focus:border-primary"
            type="text"
            value={displayName}
            onChange={event => setDisplayName(event.target.value)}
            autoComplete="name"
          />
        </label>

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
            autoComplete="new-password"
          />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit">Create account</Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link className="text-accent hover:underline" to="/auth/sign-in">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
