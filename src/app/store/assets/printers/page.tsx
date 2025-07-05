'use client';

import { useState, useEffect } from 'react';
import ItemManagement from '@/app/components/ItemManagement';
import BackButton from '@/app/components/BackButton';
import type { Item } from '@/app/components/ItemManagement';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

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
const API_BASE_URL = APIURL + '/store/assets/printers';

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
    } catch {
      console.error('Error fetching printers:');
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
    } catch {
      console.error('Error creating printer:');
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
    } catch {
      console.error('Error updating printer:');
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
    } catch {
      console.error('Error deleting printer:');
      return false;
    }
  },
};

// Helper to convert Printer to Item for ItemManagement
const printerToItem = (p: Printer): Item => ({
  ...p,
  itemCondition: (p.condition as Item['itemCondition']) || 'new',
  purchaseDate: p.purchaseDate,
  calibrationDate: undefined,
  status: undefined,
  manufacturer: p.manufacturer,
  partNumber: undefined,
  expiryDate: undefined,
  supplier: undefined,
  model: p.model,
  serialNumber: p.serialNumber,
  lastMaintenance: p.lastMaintenance,
});

export default function PrintersPage() {
  const [items, setItems] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Printers', 'Scanners', 'Copiers', 'Fax Machines', 'Other'];

  // Load printer items on component mount
  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    setLoading(true);
    try {
      const printerItems = await printersAPI.getAll();
      setItems(printerItems);
    } catch {
      toast.error('Failed to load printer items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newItem: Omit<Item, 'id' | 'lastUpdated'>) => {
    try {
      const printer: Omit<Printer, 'id' | 'lastUpdated'> = {
        ...newItem,
        condition: newItem.itemCondition as Printer['condition'],
        purchaseDate: newItem.purchaseDate,
        manufacturer: newItem.manufacturer,
        model: newItem.model,
        serialNumber: newItem.serialNumber,
      };
      const createdItem = await printersAPI.create(printer);
      if (createdItem) {
        setItems(prevItems => [...prevItems, createdItem]);
        toast.success('Printer item added successfully!');
      } else {
        toast.error('Failed to add printer item');
      }
    } catch {
      toast.error('Failed to add printer item');
    }
  };

  const handleEdit = async (id: string, updatedItem: Partial<Item>) => {
    try {
      const printer: Partial<Printer> = {
        ...updatedItem,
        condition: updatedItem.itemCondition as Printer['condition'],
        purchaseDate: updatedItem.purchaseDate,
        manufacturer: updatedItem.manufacturer,
        model: updatedItem.model,
        serialNumber: updatedItem.serialNumber,
      };
      const updated = await printersAPI.update(id, printer);
      if (updated) {
        setItems(prevItems => prevItems.map(item => item.id === id ? updated : item));
        toast.success('Printer item updated successfully!');
      } else {
        toast.error('Failed to update printer item');
      }
    } catch {
      toast.error('Failed to update printer item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const deleted = await printersAPI.delete(id);
      if (deleted) {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        toast.success('Printer item deleted successfully!');
      } else {
        toast.error('Failed to delete printer item');
      }
    } catch {
      toast.error('Failed to delete printer item');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading printer items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton />
      
      <ItemManagement
        title="Printers & Equipment"
        items={items.map(printerToItem)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        categories={categories}
      />
    </div>
  );
}