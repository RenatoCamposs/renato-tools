'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BoardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/tools');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--neutral-50)]">
      <div className="w-8 h-8 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
