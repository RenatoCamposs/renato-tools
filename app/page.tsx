'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/board');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--neutral-50)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
