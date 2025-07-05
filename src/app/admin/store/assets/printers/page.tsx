'use client';

import { useState,useEffect } from 'react';
import AdminStore from '@/app/components/AdminStore';
import { 
 
  ArrowLeft,
 
} from 'lucide-react';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
interface Printer {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: Date;
  condition: 'new' | 'good' | 'fair' | 'poor';
  purchaseDate?: Date;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  lastMaintenance?: Date;
  itemCondition?: string; // For API compatibility
}

interface ApiPrinterItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  itemCondition?: string;
  condition?: string;
  lastUpdated?: string;
  purchaseDate?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  lastMaintenance?: string;
}

// API service functions
const API_BASE_URL = APIURL +'/store/assets/printers';

const printersAPI = {
  // GET - Fetch all printer items
  getAll: async (): Promise<Printer[]> => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch printers');
      const data = await response.json();
      
      // Transform API response to match our interface
      return data.map((item: ApiPrinterItem) => ({
        ...item,
        condition: item.itemCondition || item.condition,
        lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
        lastMaintenance: item.lastMaintenance ? new Date(item.lastMaintenance) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching printers:', error);
      return [];
    }
  },

  // POST - Create new printer item
  create: async (item: Omit<Printer, 'id' | 'lastUpdated'>): Promise<Printer | null> => {
    try {
      const payload = {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        location: item.location,
        itemCondition: item.condition,
        lastUpdated: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        ...(item.manufacturer && { manufacturer: item.manufacturer }),
        ...(item.model && { model: item.model }),
        ...(item.serialNumber && { serialNumber: item.serialNumber }),
        ...(item.purchaseDate && { purchaseDate: item.purchaseDate.toISOString().split('T')[0] }),
        ...(item.lastMaintenance && { lastMaintenance: item.lastMaintenance.toISOString().split('T')[0] }),
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create printer');
      const data = await response.json();
      
      return {
        ...data,
        condition: data.itemCondition || data.condition,
        lastUpdated: new Date(),
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : item.purchaseDate,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : item.lastMaintenance,
      };
    } catch (error) {
      console.error('Error creating printer:', error);
      return null;
    }
  },

  // PUT - Update printer item
  update: async (id: string, updates: Partial<Printer>): Promise<Printer | null> => {
    try {
      const payload = {
        ...(updates.name && { name: updates.name }),
        ...(updates.category && { category: updates.category }),
        ...(updates.quantity !== undefined && { quantity: updates.quantity }),
        ...(updates.location && { location: updates.location }),
        ...(updates.condition && { itemCondition: updates.condition }),
        lastUpdated: new Date().toISOString().split('T')[0],
        ...(updates.manufacturer && { manufacturer: updates.manufacturer }),
        ...(updates.model && { model: updates.model }),
        ...(updates.serialNumber && { serialNumber: updates.serialNumber }),
        ...(updates.purchaseDate && { purchaseDate: updates.purchaseDate.toISOString().split('T')[0] }),
        ...(updates.lastMaintenance && { lastMaintenance: updates.lastMaintenance.toISOString().split('T')[0] }),
      };

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update printer');
      const data = await response.json();
      
      return {
        ...data,
        condition: data.itemCondition || data.condition,
        lastUpdated: new Date(),
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
      };
    } catch (error) {
      console.error('Error updating printer:', error);
      return null;
    }
  },

  // DELETE - Remove printer item
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting printer:', error);
      return false;
    }
  },
};

export default function PrintersPage() {
  const [items, setItems] = useState<Printer[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const categories = ['Printers', 'Scanners', 'Copiers', 'Fax Machines', 'Other'];

  // Load printer items on component mount
  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    setLoading(true);
    setError(null);
    try {
      const printerItems = await printersAPI.getAll();
      setItems(printerItems);
    } catch (err) {
      setError('Failed to load printer items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div>
     <Link href="/admin/store" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            </div>
      <AdminStore
        title="Printers & Equipment"
        items={items}
       
        categories={categories}
      />
    </div>
  );
} 