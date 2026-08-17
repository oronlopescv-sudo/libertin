'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Déjà connecté : ce formulaire n'a pas lieu d'être. Sans cette
  // redirection, la navbar affiche le compte connecté pendant que la page
  // demande quand même de se connecter — le site paraît cassé.
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/decouvrir');
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <LoginForm />
    </div>
  );
}
