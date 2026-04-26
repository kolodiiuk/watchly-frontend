import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import { type SignUpRequest, useSignUpMutation } from '../../../app/api/authApi.ts';

export function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('jane@example.com');
  const [password, setPassword] = useState('Password1');
  const [error, setError] = useState<string | null>(null);
  const [signUp] = useSignUpMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    await signUp({
      email: trimmedEmail,
      password: trimmedPassword,
    } as SignUpRequest)
      .unwrap()
      .then(() => setTimeout(() => navigate('/auth/sign-in'), 1500))
      .catch((_: Error) => {
        setError('An error occurred');
      });
  };

  return (
    <Card tone="raised">
      <div className="flex items-center justify-center gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-semibold text-text">Create your account</h1>
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
            autoComplete="new-password"
          />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex justify-center">
          <Button type="submit">Create account</Button>
        </div>
      </form>

      <div className="flex justify-center">
        <p className="mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link className="text-accent hover:underline" to="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}
