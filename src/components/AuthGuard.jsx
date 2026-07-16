"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';

export default function AuthGuard({ children }) {
  const { isLoggedIn, loading } = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      // Also allow forgot-password public route
      const isPublicRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
      if (!isLoggedIn && !isPublicRoute) {
        router.push('/login');
      }
    }
  }, [isLoggedIn, loading, pathname, router, mounted]);

  // Don't render anything until mounted and firebase finishes loading auth state
  if (!mounted || loading) {
    return (
      <div style={{ height: '100vh', width: '100vw', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.2)' }}>Loading...</div>
      </div>
    );
  }
  if (!mounted) return null;
  
  if (!isLoggedIn && pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgot-password') {
    return (
      <div style={{ height: '100vh', width: '100vw', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Simple loading state while redirecting */}
      </div>
    );
  }

  return <>{children}</>;
}
