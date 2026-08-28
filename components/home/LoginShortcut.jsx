'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginShortcut() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Control (or Meta/Command on Mac) + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        router.push('/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null; // This component does not render anything visually
}
