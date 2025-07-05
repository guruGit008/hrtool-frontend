'use client';


import { useRouter } from 'next/navigation';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function DataManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

 

  const handleLogout = () => {
  
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Enterprise Data Manager" handleLogout={handleLogout} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 