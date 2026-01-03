import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth';

export const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Or a loading spinner
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};