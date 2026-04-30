import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'ADMIN' | 'CITOYEN';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // Rediriger vers le dashboard approprié si le rôle ne correspond pas
    return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/citizen/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
