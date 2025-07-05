import { useState } from 'react';
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
  X, 
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
  { id: 'dashboard', name: 'Dashboard', icon: TrendingUp, color: 'bg-blue-500', path: '/admin/data-manager' },
  { id: 'sales', name: 'Sales Management', icon: TrendingUp, color: 'bg-green-500', path: '/admin/data-manager/sales' },
  { id: 'purchase', name: 'Purchase Management', icon: ShoppingCart, color: 'bg-orange-500', path: '/admin/data-manager/purchase' },
  { id: 'logistics', name: 'Logistics Documents', icon: Truck, color: 'bg-orange-500', path: '/admin/data-manager/logistics' },
  { id: 'registration', name: 'Company Registration', icon: FileText, color: 'bg-purple-500', path: '/admin/data-manager/registration' },
  { id: 'banking', name: 'Bank Documents', icon: CreditCard, color: 'bg-indigo-500', path: '/admin/data-manager/bank' },
  { id: 'billing', name: 'Billing Management', icon: Receipt, color: 'bg-teal-500', path: '/admin/data-manager/billing' },
  { id: 'ca-documents', name: 'CA Documents', icon: Calculator, color: 'bg-red-500', path: '/admin/data-manager/ca' },
  { id: 'tenders', name: 'Tender Management', icon: Gavel, color: 'bg-yellow-500', path: '/admin/data-manager/tender' },
  { id: 'finance', name: 'Finance Reports', icon: TrendingUp, color: 'bg-pink-500', path: '/admin/data-manager/finance' }
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800">DataManager Pro</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {modules.map((module) => (
          <Link
            key={module.id}
            href={module.path}
            className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-3'} py-3 text-left rounded-lg transition-colors ${
              pathname === module.path
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <module.icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="ml-3 font-medium">{module.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
} 