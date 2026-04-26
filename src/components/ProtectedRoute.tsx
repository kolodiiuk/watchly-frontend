import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../app/models/UserRole';
import { useAuth } from '../features/auth/services/AuthProvider.tsx';

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRoles?: UserRole[];
};

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location.pathname }} />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const availableRoles = new Set<string>([
      ...(user.userRoles ?? []),
      ...(role ? [role] : []),
      ...(user.role ? [user.role] : []),
    ]);
    const hasRole = requiredRoles.some(requiredRole => availableRoles.has(requiredRole));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
