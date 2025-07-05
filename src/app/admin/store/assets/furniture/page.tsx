'use client';

import { useState, useEffect } from 'react';
import AdminStore from '@/app/components/AdminStore';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { APIURL } from '@/constants/api';

interface Furniture {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: Date;
  condition: 'new' | 'good' | 'fair' | 'poor';
  purchaseDate?: Date;
  itemCondition?: string; // For API compatibility
}

interface ApiFurnitureItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  itemCondition?: string;
  condition?: string;
  lastUpdated?: string;
  purchaseDate?: string;
}

// API service functions
const API_BASE_URL = APIURL + '/store/assets/furniture';

const furnitureAPI = {
  // GET - Fetch all furniture items
  getAll: async (): Promise<Furniture[]> => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch furniture');
      const data = await response.json();
      
      // Transform API response to match our interface
      return data.map((item: ApiFurnitureItem) => ({
        ...item,
        condition: item.itemCondition || item.condition,
        lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching furniture:', error);
      return [];
    }
  },

  // POST - Create new furniture item
  create: async (item: Omit<Furniture, 'id' | 'lastUpdated'>): Promise<Furniture | null> => {
    try {
      const payload = {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        location: item.location,
        lastUpdated: [
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          new Date().getDate()
        ],
        itemCondition: item.condition
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create furniture');
      const data = await response.json();
      
      return {
        ...data,
        condition: data.itemCondition || data.condition,
        lastUpdated: new Date(),
        purchaseDate: item.purchaseDate,
      };
    } catch (error) {
      console.error('Error creating furniture:', error);
      return null;
    }
  },

  // PUT - Update furniture item
  update: async (id: string, updates: Partial<Furniture>): Promise<Furniture | null> => {
    try {
      const payload = {
        ...(updates.name && { name: updates.name }),
        ...(updates.category && { category: updates.category }),
        ...(updates.quantity !== undefined && { quantity: updates.quantity }),
        ...(updates.location && { location: updates.location }),
        lastUpdated: [
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          new Date().getDate()
        ],
        ...(updates.condition && { itemCondition: updates.condition })
      };

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update furniture');
      const data = await response.json();
      
      return {
        ...data,
        condition: data.itemCondition || data.condition,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error updating furniture:', error);
      return null;
    }
  },

  // DELETE - Remove furniture item
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting furniture:', error);
      return false;
    }
  },
};

export default function FurniturePage() {
  const [items, setItems] = useState<Furniture[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const categories = ['Desks', 'Chairs', 'Cabinets', 'Tables', 'Other'];

  // Load furniture items on component mount
  useEffect(() => {
    loadFurniture();
  }, []);

  const loadFurniture = async () => {
    setLoading(true);
    setError(null);
    try {
      const furnitureItems = await furnitureAPI.getAll();
      setItems(furnitureItems);
    } catch (err) {
      setError('Failed to load furniture items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/store" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      <AdminStore
        title="Office Furniture"
        items={items}
        categories={categories}
      />
    </div>
  );
}