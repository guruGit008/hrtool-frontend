'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  FileText, 
  Laptop, 
  Calendar, 
  Award, 
  UserPlus, 
  Clock,
 
  LucideIcon,
 
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: Home, path: '/hr' },
  { id: 'documents', label: 'Employee Documents', icon: FileText, path: '/hr/documents' },
  { id: 'assets', label: 'Asset Management', icon: Laptop, path: '/hr/assets' },
  { id: 'leaves', label: 'Leave Management', icon: Calendar, path: '/hr/leaves' },
  { id: 'performance', label: 'Performance', icon: Award, path: '/hr/performance' },
  { id: 'joining', label: 'Joining/Relieving', icon: UserPlus, path: '/hr/joining' },
  { id: 'activities', label: 'Weekly Activities', icon: Clock, path: '/hr/activities' }
];

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();



  const handleLogout = () => {
    
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg"> {/* Gradient background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center space-x-2"> {/* Added space-x-2 for icon */}
            {/* <AdminIcon className="h-6 w-6 text-white" /> Uncomment and replace with actual icon */}
            <h1 className="text-2xl font-extrabold text-white tracking-wide">
           HR manager
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
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <a
                    key={item.id}
                    href={item.path}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
} 