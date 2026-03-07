import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ReactNode } from 'react';

interface GuestGuardProps {
  children: ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/documents" replace />;
  }

  return <>{children}</>;
}
