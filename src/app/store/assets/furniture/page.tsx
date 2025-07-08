'use client';

import { useState, useEffect } from 'react';
import ItemManagement from '@/app/components/ItemManagement';
import BackButton from '@/app/components/BackButton';
import type { Item } from '@/app/components/ItemManagement';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

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
    } catch {
      console.error('Error fetching furniture:');
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
    } catch {
      console.error('Error creating furniture:');
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
    } catch {
      console.error('Error updating furniture:');
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
    } catch {
      console.error('Error deleting furniture:');
      return false;
    }
  },
};

// Helper to convert Furniture to Item for ItemManagement
const furnitureToItem = (f: Furniture): Item => ({
  ...f,
  itemCondition: (f.condition as Item['itemCondition']) || 'new',
  purchaseDate: f.purchaseDate,
  calibrationDate: undefined,
  status: undefined,
  manufacturer: undefined,
  partNumber: undefined,
  expiryDate: undefined,
  supplier: undefined,
  model: undefined,
  serialNumber: undefined,
  lastMaintenance: undefined,
});

export default function FurniturePage() {
  const [items, setItems] = useState<Furniture[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Desks', 'Chairs', 'Cabinets', 'Tables', 'Other'];

  // Load furniture items on component mount
  useEffect(() => {
    loadFurniture();
  }, []);

  const loadFurniture = async () => {
    setLoading(true);
    try {
      const furnitureItems = await furnitureAPI.getAll();
      setItems(furnitureItems);
    } catch {
      toast.error('Failed to load furniture items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newItem: Omit<Item, 'id' | 'lastUpdated'>) => {
    const furniture: Omit<Furniture, 'id' | 'lastUpdated'> = {
      ...newItem,
      condition: newItem.itemCondition as Furniture['condition'],
      purchaseDate: newItem.purchaseDate,
    };
    try {
      const createdItem = await furnitureAPI.create(furniture);
      if (createdItem) {
        setItems(prevItems => [...prevItems, createdItem]);
        toast.success('Furniture item added successfully!');
      } else {
        toast.error('Failed to add furniture item');
      }
    } catch {
      toast.error('Failed to add furniture item');
    }
  };

  const handleEdit = async (id: string, updatedItem: Partial<Item>) => {
    try {
      const furniture: Partial<Furniture> = {
        ...updatedItem,
        condition: updatedItem.itemCondition as Furniture['condition'],
        purchaseDate: updatedItem.purchaseDate,
      };
      const updated = await furnitureAPI.update(id, furniture);
      if (updated) {
        setItems(prevItems => prevItems.map(item => item.id === id ? updated : item));
        toast.success('Furniture item updated successfully!');
      } else {
        toast.error('Failed to update furniture item');
      }
    } catch {
      toast.error('Failed to update furniture item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const deleted = await furnitureAPI.delete(id);
      if (deleted) {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        toast.success('Furniture item deleted successfully!');
      } else {
        toast.error('Failed to delete furniture item');
      }
    } catch {
      toast.error('Failed to delete furniture item');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading furniture items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton />
      
      <ItemManagement
        title="Office Furniture"
        items={items.map(furnitureToItem)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        categories={categories}
      />
    </div>
  );
}
