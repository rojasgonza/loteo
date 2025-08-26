// components/ProtectedRoute.tsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  nivelMinimo?: number; // nivel requerido para entrar
}

export default function ProtectedRoute({ children, nivelMinimo = 1 }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || (user && user.nivel < nivelMinimo)) {
        router.push('/'); // redirige si no tiene nivel
      }
    }
  }, [loading, isAuthenticated, user, router, nivelMinimo]);

  if (loading || !isAuthenticated || (user && user.nivel < nivelMinimo)) {
    return <div className="p-4 text-gray-500">Cargando...</div>;
  }

  return <>{children}</>;
}
