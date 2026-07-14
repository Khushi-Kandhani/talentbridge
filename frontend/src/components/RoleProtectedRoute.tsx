import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { useAuthStore, UserRole } from '../store/authStore';

type RoleProtectedRouteProps = {
  allowedRoles: UserRole[];
};

export default function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const role = useAuthStore((s) => s.role);
  const context = useOutletContext();
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <Outlet context={context} />;
}
