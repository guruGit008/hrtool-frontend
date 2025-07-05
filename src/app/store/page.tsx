'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
 
  ArchiveBoxIcon,
  BookOpenIcon,
  DocumentArrowUpIcon,
  BeakerIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  CubeTransparentIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  TableCellsIcon,
  CpuChipIcon,
  PrinterIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { APIURL } from '@/constants/api';

type SectionColor = 'indigo' | 'teal' | 'rose';

interface ItemData {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  apiUrl: string;
}

interface SectionData {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: SectionColor;
  count: string;
  items: ItemData[];
}

export default function StorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<SectionData[]>([]);
 

  const initialSections: SectionData[] = [
    {
      title: "Inventory & Asset Management",
      description: "Manage office supplies and assets",
      icon: PencilSquareIcon,
      color: "indigo" as SectionColor,
      count: "0",
      items: [
        {
          title: "Consumables",
          description: "Daily office supplies and consumables",
          href: "/store/stationary/regular",
          icon: BookOpenIcon,
          count: 0,
          apiUrl: APIURL +'/store/stationary/regular',
        },
        {
          title: "Fixed Assets",
          description: "Permanent office supplies",
          href: "/store/stationary/fixed",
          icon: ArchiveBoxIcon,
          count: 0,
          apiUrl: APIURL +'/store/stationary/fixed',
        },
        {
          title: "Inventory Transactions",
          description: "Track office supplies movement",
          href: "/store/stationary/inventory",
          icon: DocumentArrowUpIcon,
          count: 0,
          apiUrl: APIURL +'/store/stationary/inventory',
        }
      ]
    },
    {
      title: "Laboratory Equipment",
      description: "Laboratory equipment and supplies management",
      icon: BeakerIcon,
      color: "teal" as SectionColor,
      count: "0",
      items: [
        {
          title: "Lab Equipment",
          description: "Lab equipment and tools",
          href: "/store/lab/instruments",
          icon: PaintBrushIcon,
          count: 0,
          apiUrl: APIURL + '/store/lab/instruments',
        },
        {
          title: "Spare Parts & Modules",
          description: "Lab parts and components",
          href: "/store/lab/components",
          icon: WrenchScrewdriverIcon,
          count: 0,
          apiUrl: APIURL +'/store/lab/components',
        },
        {
          title: "Lab Consumables",
          description: "Lab consumables and materials",
          href: "/store/lab/materials",
          icon: CubeTransparentIcon,
          count: 0,
          apiUrl: APIURL +'/store/lab/materials',
        },
        {
          title: "Usage & Movement Logs",
          description: "Track laboratory inventory movement",
          href: "/store/lab/inventory",
          icon: ChartBarIcon,
          count: 0,
          apiUrl: APIURL +'/store/lab/inventory',
        }
      ]
    },
    {
      title: "Inventory Segments",
      description: "Permanent office equipment and furniture",
      icon: BuildingOfficeIcon,
      color: "rose" as SectionColor,
      count: "0",
      items: [
        {
          title: "Office furniture and fixtures",
          description: "Office furniture and fixtures",
          href: "/store/assets/furniture",
          icon: TableCellsIcon,
          count: 0,
          apiUrl: APIURL +'/store/assets/furniture',
        },
        {
          title: "Computers and electronic systems",
          description: "Computers and electronic systems",
          href: "/store/assets/systems",
          icon: CpuChipIcon,
          count: 0,
          apiUrl: APIURL +'/store/assets/systems',
        },
        {
          title: "Printers and other office equipment",
          description: "Printers and other office equipment",
          href: "/store/assets/printers",
          icon: PrinterIcon,
          count: 0,
          apiUrl: APIURL +'/store/assets/printers',
        }
      ]
    }
  ];

  // Role and token check before fetching data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');

    if (!token || !roles.includes('STORE')) {
      router.replace('/login');
    } else {
      setLoading(true);
      fetchAllCounts();
    }
    // eslint-disable-next-line
  }, [router]);

  const fetchAllCounts = async () => {
    try {
      // setLoading(true); // Already set in useEffect
      const token = localStorage.getItem('token');
      // Token is already checked in useEffect, so this is just for headers
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Create a copy of initial sections to update
      const updatedSections = [...initialSections];
      
      // Fetch counts for each item in each section
      for (let sectionIndex = 0; sectionIndex < updatedSections.length; sectionIndex++) {
        const section = updatedSections[sectionIndex];
        let sectionTotal = 0;

        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
          const item = section.items[itemIndex];
          
          try {
            const response = await fetch(item.apiUrl.replace(APIURL , process.env.NEXT_PUBLIC_API_URL || APIURL), {
              method: 'GET',
              headers,
            });

            if (response.ok) {
              const data = await response.json();
              // Assuming the API returns an array or object with count/length property
              let count = 0;
              
              if (Array.isArray(data)) {
                count = data.length;
              } else if (data && typeof data.count === 'number') {
                count = data.count;
              } else if (data && typeof data.total === 'number') {
                count = data.total;
              } else if (data && typeof data.length === 'number') {
                count = data.length;
              }

              updatedSections[sectionIndex].items[itemIndex].count = count;
              sectionTotal += count;
            

              // Count active assets (from Capital Office Assets section)
              if (section.title === "Inventory Segments") {
                
              }
            } else {
              console.error(`Failed to fetch count for ${item.title}:`, response.statusText);
            }
          } catch (error) {
            console.error(`Error fetching count for ${item.title}:`, error);
          }
        }

        // Update section total count
        updatedSections[sectionIndex].count = sectionTotal.toString();
      }

      // Update sections state
      setSections(updatedSections);

    

    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading store data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
     
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       

        {/* Main Content */}
        <div className="pb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Inventory Segments
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your inventory and assets across different segments
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section, sectionIndex) => {
              const IconComponent = section.icon;
              const colorClasses = {
                indigo: {
                  bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                  border: 'border-indigo-200 dark:border-indigo-800',
                  icon: 'bg-indigo-500',
                  badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                },
                teal: {
                  bg: 'bg-teal-50 dark:bg-teal-900/20',
                  border: 'border-teal-200 dark:border-teal-800',
                  icon: 'bg-teal-500',
                  badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                },
                rose: {
                  bg: 'bg-rose-50 dark:bg-rose-900/20',
                  border: 'border-rose-200 dark:border-rose-800',
                  icon: 'bg-rose-500',
                  badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                }
              };
              
              const colors = colorClasses[section.color];
              
              return (
                <div key={sectionIndex} className={`${colors.bg} ${colors.border} border rounded-2xl p-8`}>
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center shadow-md`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 ${colors.badge} rounded-full text-sm font-semibold`}>
                      {section.count} items
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.items.map((item, itemIndex) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link key={itemIndex} href={item.href} className="group">
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group-hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center shadow-sm`}>
                                <ItemIcon className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {item.count}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}