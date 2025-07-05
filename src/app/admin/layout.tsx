'use client';


import { useRouter } from 'next/navigation';
// You might import an icon library or define your own SVG here
// import { AdminIcon } from './icons'; // Example: if you have an AdminIcon component

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

 

  const handleLogout = () => {
  
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg"> {/* Gradient background */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center space-x-2"> {/* Added space-x-2 for icon */}
              {/* <AdminIcon className="h-6 w-6 text-white" /> Uncomment and replace with actual icon */}
              <button
                onClick={() => router.push('/admin')}
                className="text-2xl font-extrabold text-white tracking-wide hover:text-blue-200 transition-colors duration-200 cursor-pointer"
              >
                Admin Portal
              </button>
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

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}