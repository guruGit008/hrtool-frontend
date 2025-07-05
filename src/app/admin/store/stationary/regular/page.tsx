'use client';

import { useState,useEffect, useCallback } from 'react';
import AdminStore from '@/app/components/AdminStore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { APIURL } from '@/constants/api';

interface OfficeSuppliesItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: Date;
  condition: 'new' | 'good' | 'fair' | 'poor';
}

interface ApiOfficeSuppliesItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  location: string;
  itemCondition: string | null;
  lastUpdated: [number, number, number]; // [year, month, day]
}



const API_BASE_URL = APIURL +'/store/stationary/regular';

export default function RegularStationaryPage() {
  const [items, setItems] = useState<OfficeSuppliesItem[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const categories = ['Paper', 'Writing', 'Desk Accessories', 'Binders', 'Seating', 'Other'];

  // Helper function to convert API response to local format
  const convertApiToLocal = (apiItem: ApiOfficeSuppliesItem): OfficeSuppliesItem => {
    const [year, month, day] = apiItem.lastUpdated;
    return {
      id: apiItem.id.toString(),
      name: apiItem.name,
      quantity: apiItem.quantity,
      category: apiItem.category,
      location: apiItem.location,
      lastUpdated: new Date(year, month - 1, day), // month is 0-indexed in JS Date
      condition: (apiItem.itemCondition?.toLowerCase() as 'new' | 'good' | 'fair' | 'poor') || 'good',
    };
  };


  // Fetch all items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiOfficeSuppliesItem[] = await response.json();
      const convertedItems = data.map(convertApiToLocal);
      setItems(convertedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <Link href="/admin/store" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      <AdminStore
        title="Regular Office Supplies Items"
        items={items}
        categories={categories}
      />
    </div>
  );
} 