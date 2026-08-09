'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <LoginForm />
    </div>
  );
}
