import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  ShoppingCart,
  Truck,
  FileText,
  CreditCard,
  Receipt,
  Calculator,
  Gavel,
  Menu,
  LucideIcon
} from 'lucide-react';

interface Module {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  path: string;
}

const modules: Module[] = [
  { id: 'dashboard', name: 'Dashboard', icon: TrendingUp, color: 'bg-blue-500', path: '/data-manager' },
  { id: 'sales', name: 'Sales Management', icon: TrendingUp, color: 'bg-green-500', path: '/data-manager/sales' },
  { id: 'purchase', name: 'Purchase Management', icon: ShoppingCart, color: 'bg-orange-500', path: '/data-manager/purchase' },
  { id: 'logistics', name: 'Logistics Documents', icon: Truck, color: 'bg-orange-500', path: '/data-manager/logistics' },
  { id: 'registration', name: 'Company Registration', icon: FileText, color: 'bg-purple-500', path: '/data-manager/registration' },
  { id: 'banking', name: 'Bank Documents', icon: CreditCard, color: 'bg-indigo-500', path: '/data-manager/bank' },
  { id: 'billing', name: 'Billing Management', icon: Receipt, color: 'bg-teal-500', path: '/data-manager/billing' },
  { id: 'ca-documents', name: 'CA Documents', icon: Calculator, color: 'bg-red-500', path: '/data-manager/ca' },
  { id: 'tenders', name: 'Tender Management', icon: Gavel, color: 'bg-yellow-500', path: '/data-manager/tender' },
  { id: 'finance', name: 'Finance Reports', icon: TrendingUp, color: 'bg-pink-500', path: '/data-manager/finance' }
];

export default function Sidebar() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const pathname = usePathname();
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Show sidebar on menu hover, hide with delay on mouse leave
  const handleMenuEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setSidebarVisible(true);
  };
  const handleMenuLeave = () => {
    hoverTimeout.current = setTimeout(() => setSidebarVisible(false), 120);
  };

  return (
    <>
      {/* Floating menu button - only show when sidebar is closed */}
      {!sidebarVisible && (
        <div
          className="fixed top-4 left-4 z-[100] lg:block hidden"
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <button
            className="p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-7 h-7 text-blue-700" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full bg-white shadow-lg flex flex-col
          transition-all duration-300
          ${sidebarVisible ? 'w-64 opacity-100 pointer-events-auto' : 'w-0 opacity-0 pointer-events-none'}
          hidden lg:flex
        `}
        style={{ minHeight: '100vh' }}
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleMenuLeave}
      >
        <div className="flex items-center p-4 border-b min-h-[56px]">
          <span className="text-xl font-bold text-gray-800 whitespace-nowrap">Enterprise Data Manager</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {modules.map((module) => {
            const isActive = pathname === module.path;
            return (
              <Link
                key={module.id}
                href={module.path}
                className={`
                  flex items-center rounded-lg transition-colors px-4 py-3
                  ${isActive ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                <module.icon className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3 font-medium">{module.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}