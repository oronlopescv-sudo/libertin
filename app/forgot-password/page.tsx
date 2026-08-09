'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { ForgotPasswordForm } from '@/components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <ForgotPasswordForm />
    </div>
  );
}
