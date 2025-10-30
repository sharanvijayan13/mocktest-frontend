"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store token in localStorage
      localStorage.setItem('token', token);

      // Redirect to profile page
      router.push('/profile');
    } else {
      // No token found, redirect to login
      router.push('/login?error=auth-failed');
    }
  }, [searchParams, router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h2>Completing authentication...</h2>
      <p>Please wait while we log you in.</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h2>Loading...</h2>
        <p>Please wait.</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}