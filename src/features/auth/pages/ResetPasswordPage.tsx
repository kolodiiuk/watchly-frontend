import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '../../../components/common/Card.tsx';
import { useResetPasswordMutation } from '../../profile/api/usersApi.ts';

type ResetStatus = 'loading' | 'success' | 'error';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ResetStatus>('loading');
  const [message, setMessage] = useState<string>('Resetting password...');
  const [resetPassword] = useResetPasswordMutation();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (hasRequestedRef.current) {
      return;
    }
    hasRequestedRef.current = true;

    const token = searchParams.get('token')?.trim();
    if (!token) {
      setStatus('error');
      setMessage('Reset token is missing.');
      return;
    }

    resetPassword({ token })
      .unwrap()
      .then(() => {
        setStatus('success');
        setMessage('Password has been reset successfully.');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Could not reset password. The link may be invalid or expired.');
      });
  }, [resetPassword, searchParams]);

  return (
    <Card tone="raised">
      <h1 className="mt-2 text-3xl font-semibold text-text">Reset Password</h1>
      <p className="mt-6 text-sm text-muted">{message}</p>

      {status !== 'loading' ? (
        <div className="mt-6 flex justify-center text-sm text-muted">
          <Link className="text-accent hover:underline" to="/auth/sign-in">
            Back to sign in
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
