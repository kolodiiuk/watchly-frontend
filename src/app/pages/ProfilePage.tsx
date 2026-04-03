import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../features/auth/services/AuthProvider.tsx';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card tone="raised">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">Profile</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Account summary</h1>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-muted">Display name</div>
            <div className="mt-2 text-2xl font-semibold text-text">{user?.displayName}</div>
            <div className="text-sm text-muted">{user?.email}</div>
          </div>
          <Badge tone="accent">{user?.role}</Badge>
        </div>
      </Card>
    </div>
  );
}
