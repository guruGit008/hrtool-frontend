'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/store')}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
    >
      <ArrowLeftIcon className="h-5 w-5" />
      Back to Dashboard
    </button>
  );
} 