import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.tsx';
import { type SignInRequest, useSignInMutation } from '../../../app/api/authApi.ts';
import { Button } from '../../../components/ui/Button.tsx';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../app/store.ts';
import { setCredentials } from '../services/authSlice.ts';

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('jane@example.com');
  const [password, setPassword] = useState<string>('Password1');
  const [error, setError] = useState<string | null>(null);
  const [signIn] = useSignInMutation();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !password || !email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    try {
      const response = await signIn({
        email: trimmedEmail,
        password: trimmedPassword,
      } as SignInRequest).unwrap();
      dispatch(
        setCredentials({
          user: response.user ?? null,
          role: response.role,
          token: response.token,
          refreshToken: response.refreshToken,
        })
      );
      navigate('/profile', { replace: true });
    } catch {
      setError('An error occurred');
    }
  };

  return (
    <Card tone="raised">
      <div className="flex items-center justify-center gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-semibold text-text">Welcome back</h1>
        </div>
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
        <div className="-mt-1 text-right">
          <Link className="text-sm text-accent hover:underline" to="/auth/forget-password">
            Forget password
          </Link>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex justify-center">
          <Button type="submit">Sign in</Button>
        </div>
      </form>

      <div className="flex justify-center">
        <p className="mt-6 text-sm text-muted">
          No account yet?{' '}
          <Link className="text-accent hover:underline" to="/auth/sign-up">
            Create one
          </Link>
        </p>
      </div>
    </Card>
  );
}
