'use client';

import { useState, useEffect } from 'react';
import ItemManagement from '@/app/components/ItemManagement';
import BackButton from '@/app/components/BackButton';
import type { Item } from '@/app/components/ItemManagement';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface System {
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
  itemCondition?: string; // For API compatibility
}

interface ApiSystem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: string;
  itemCondition?: string;
  condition?: string;
  purchaseDate?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}

// API service functions
const API_BASE_URL = APIURL + '/store/assets/systems';

const systemsAPI = {
  // GET - Fetch all system items
  getAll: async (): Promise<System[]> => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch systems');
      const data = await response.json();

      // Transform API response to match our interface
      return data.map((item: ApiSystem) => ({
        ...item,
        condition: item.itemCondition || item.condition || 'good',
        lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
      }));
    } catch (err: unknown) { // Changed 'error: Error | unknown' to 'err: unknown'
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching systems:', errorMessage);
      return [];
    }
  },

  // POST - Create new system item
  create: async (item: Omit<System, 'id' | 'lastUpdated'>): Promise<System | null> => {
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
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create system');
      const data = await response.json();

      return {
        ...data,
        condition: data.itemCondition || data.condition || 'good',
        lastUpdated: new Date(),
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : item.purchaseDate,
      };
    } catch (err: unknown) { // Changed 'error: Error | unknown' to 'err: unknown'
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error creating system:', errorMessage);
      return null;
    }
  },

  // PUT - Update system item
  update: async (id: string, updates: Partial<System>): Promise<System | null> => {
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
      };

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update system');
      const data = await response.json();

      return {
        ...data,
        condition: data.itemCondition || data.condition || 'good',
        lastUpdated: new Date(),
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      };
    } catch (err: unknown) { // Changed 'error: Error | unknown' to 'err: unknown'
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error updating system:', errorMessage);
      return null;
    }
  },

  // DELETE - Remove system item
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (err: unknown) { // Changed 'error: Error | unknown' to 'err: unknown'
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error deleting system:', errorMessage);
      return false;
    }
  },
};

// Helper to convert System to Item for ItemManagement
const systemToItem = (s: System): Item => ({
  ...s,
  itemCondition: (s.condition as Item['itemCondition']) || 'new',
  purchaseDate: s.purchaseDate,
  calibrationDate: undefined,
  status: undefined,
  manufacturer: s.manufacturer,
  partNumber: undefined,
  expiryDate: undefined,
  supplier: undefined,
  model: s.model,
  serialNumber: s.serialNumber,
  lastMaintenance: undefined,
});

export default function SystemsPage() {
  const [items, setItems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Computers', 'Portable', 'Servers', 'Networking', 'Other'];

  // Load system items on component mount
  useEffect(() => {
    loadSystems();
  }, []);

  const loadSystems = async () => {
    setLoading(true);
    try {
      const systemItems = await systemsAPI.getAll();
      setItems(systemItems);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error(err);
      toast.error(`Failed to load system items: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newItem: Omit<Item, 'id' | 'lastUpdated'>) => {
    try {
      const system: Omit<System, 'id' | 'lastUpdated'> = {
        ...newItem,
        condition: newItem.itemCondition as System['condition'],
        purchaseDate: newItem.purchaseDate,
        manufacturer: newItem.manufacturer,
        model: newItem.model,
        serialNumber: newItem.serialNumber,
      };
      const createdItem = await systemsAPI.create(system);
      if (createdItem) {
        setItems(prevItems => [...prevItems, createdItem]);
        toast.success('System item added successfully!');
      } else {
        toast.error('Failed to add system item');
      }
    } catch {
      toast.error('Failed to add system item');
    }
  };

  const handleEdit = async (id: string, updatedItem: Partial<Item>) => {
    try {
      const system: Partial<System> = {
        ...updatedItem,
        condition: updatedItem.itemCondition as System['condition'],
        purchaseDate: updatedItem.purchaseDate,
        manufacturer: updatedItem.manufacturer,
        model: updatedItem.model,
        serialNumber: updatedItem.serialNumber,
      };
      const updated = await systemsAPI.update(id, system);
      if (updated) {
        setItems(prevItems => prevItems.map(item => item.id === id ? updated : item));
        toast.success('System item updated successfully!');
      } else {
        toast.error('Failed to update system item');
      }
    } catch {
      toast.error('Failed to update system item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const deleted = await systemsAPI.delete(id);
      if (deleted) {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        toast.success('System item deleted successfully!');
      } else {
        toast.error('Failed to delete system item');
      }
    } catch {
      toast.error('Failed to delete system item');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading system items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton />

      <ItemManagement
        title="Office Systems"
        items={items.map(systemToItem)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        categories={categories}
      />
    </div>
  );
}