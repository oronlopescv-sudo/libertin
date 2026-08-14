'use client';

import React, { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { ResetPasswordForm } from '@/components/reset-password-form';

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center min-h-[80vh] text-white">Chargement...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
