import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { useForgetPasswordMutation } from '../../../app/api/usersApi.ts';

export function ForgetPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }

    try {
      await forgetPassword({ email: trimmedEmail }).unwrap();
      setMessage('If the email exists, reset instructions have been sent.');
    } catch {
      setError('Could not send reset email.');
    }
  };

  return (
    <Card tone="raised">
      <div>
        <h1 className="mt-2 text-3xl font-semibold text-text">Forget Password</h1>
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

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-muted">{message}</p> : null}

        <div className="flex justify-center">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Email'}
          </Button>
        </div>
      </form>

      <div className="mt-6 flex justify-center text-sm text-muted">
        <Link className="text-accent hover:underline" to="/auth/sign-in">
          Back to sign in
        </Link>
      </div>
    </Card>
  );
}
