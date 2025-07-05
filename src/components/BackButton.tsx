import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href = '/finance-manager/dashboard', label = 'Back to Dashboard' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
    >
      <ArrowLeftIcon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
} 