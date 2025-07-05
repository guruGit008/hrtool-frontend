'use client';

import { useState, useEffect } from 'react';
import {  ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { 
 
  ArrowLeft,
 
} from 'lucide-react';
import Link from 'next/link';

interface LabInventory {
  id: string;
  item: string;
  category: string;
  quantity: number;
  location: string;
  itemCondition: string;
  date: [number, number, number];
  type: 'in' | 'out';
  notes: string;
}

const API_BASE_URL = ' http://localhost:8080/store/lab/inventory';

export default function LabInventoryPage() {
  const [inventory, setInventory] = useState<LabInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 

  // Fetch inventory from API on component mount
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_BASE_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }
        
        // Process and validate the data
        const processedData = data.map(item => ({
          ...item,
          id: item.id || Math.random().toString(36).substr(2, 9),
          item: item.item || '',
          category: item.category || '',
          quantity: Number(item.quantity) || 0,
          location: item.location || '',
          itemCondition: item.itemCondition || 'New',
          type: item.type || 'in',
          notes: item.notes || '',
          // Ensure date is a valid [year, month, day] array; default to current date if invalid
          date: (Array.isArray(item.date) && item.date.length === 3 && !isNaN(new Date(item.date[0], item.date[1] - 1, item.date[2]).getTime())) 
            ? item.date 
            : [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()],
        }));
        
        setInventory(processedData);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch inventory');
        setInventory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-6">
        <Link href="/admin/store" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lab Inventory Management
          </h2>
         
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400 text-center py-4">
            {error}
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No inventory items found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
         
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
          
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
               
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {inventory.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.item}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.location}</td>
                 
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'in' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {item.type === 'in' ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(item.date[0], item.date[1] - 1, item.date[2]).toLocaleDateString()}
                    </td>
                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

       
      </div>
    </div>
  );
} 