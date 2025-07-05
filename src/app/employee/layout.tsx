'use client';
import React from 'react';
import { useRouter } from 'next/navigation';




export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 
  const router = useRouter();

  const handleLogout = () => {
  
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg"> {/* Gradient background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center space-x-2"> {/* Added space-x-2 for icon */}
            {/* <AdminIcon className="h-6 w-6 text-white" /> Uncomment and replace with actual icon */}
            <h1 className="text-2xl font-extrabold text-white tracking-wide">
         Employee
            </h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="px-6 py-2 border-2 border-white text-sm font-semibold rounded-full text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition ease-in-out duration-300" // Styled as a pill button with inverse hover
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[calc(100vh-8rem)]">
          {children}
        </div>
      </main>
    </div>
  );
} 