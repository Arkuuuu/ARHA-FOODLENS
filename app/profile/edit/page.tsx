'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileEditPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to onboarding setup wizard to adjust details easily
    router.replace('/profile/setup');
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center text-slate-500 text-xs">
      Loading profile manager...
    </div>
  );
}
