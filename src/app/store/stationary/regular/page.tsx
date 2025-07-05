'use client';
import { useState, useEffect, useCallback } from 'react';
import ItemManagement from '@/app/components/ItemManagement';
import BackButton from '@/app/components/BackButton';
import type { Item } from '@/app/components/ItemManagement';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface StationaryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: Date;
  condition: 'new' | 'good' | 'fair' | 'poor';
}

interface ApiStationaryItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  location: string;
  itemCondition: string | null;
  lastUpdated: [number, number, number]; // [year, month, day]
}

interface ApiRequestBody {
  name: string;
  category: string;
  quantity: number;
  location: string;
  itemCondition: string;
  lastUpdated: string;
}

const API_BASE_URL = APIURL +'/store/stationary/regular';

// Helper function to convert API response to local format
const convertApiToLocal = (apiItem: ApiStationaryItem): StationaryItem => {
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

// Helper function to convert local format to API request
const convertLocalToApi = (localItem: Omit<StationaryItem, 'id' | 'lastUpdated'>): ApiRequestBody => {
  const today = new Date();
  return {
    name: localItem.name,
    category: localItem.category,
    quantity: localItem.quantity,
    location: localItem.location,
    itemCondition: localItem.condition,
    lastUpdated: today.toISOString().split('T')[0], // YYYY-MM-DD format
  };
};

// Helper to convert StationaryItem to Item for ItemManagement
const stationaryToItem = (stationary: StationaryItem): Item => ({
  id: stationary.id,
  name: stationary.name,
  quantity: stationary.quantity,
  category: stationary.category,
  location: stationary.location,
  lastUpdated: stationary.lastUpdated,
  itemCondition: stationary.condition,
  purchaseDate: undefined,
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

// Helper to convert ItemManagement's Item to StationaryItem for handleAdd
const itemToStationary = (item: Omit<Item, 'id' | 'lastUpdated'>): Omit<StationaryItem, 'id' | 'lastUpdated'> => ({
  name: item.name,
  quantity: item.quantity,
  category: item.category,
  location: item.location,
  condition: item.itemCondition as StationaryItem['condition'],
});

export default function RegularStationaryPage() {
  const [items, setItems] = useState<StationaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Paper', 'Writing', 'Desk Accessories', 'Binders', 'Seating', 'Other'];

  // Fetch all items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiStationaryItem[] = await response.json();
      const convertedItems = data.map(convertApiToLocal);
      setItems(convertedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Add new item
  const handleAdd = async (newItem: Omit<Item, 'id' | 'lastUpdated'>) => {
    try {
      setError(null);
      const stationaryItem = itemToStationary(newItem);
      const apiRequestBody = convertLocalToApi(stationaryItem);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the items list after successful addition
      await fetchItems();
      toast.success('Stationary item added successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      toast.error(err instanceof Error ? err.message : 'Failed to add item');
      console.error('Error adding item:', err);
    }
  };

  // Edit existing item
  const handleEdit = async (id: string, updatedItem: Partial<Item>) => {
    try {
      setError(null);
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) {
        throw new Error('Item not found');
      }
      // Merge current item with updates, mapping itemCondition to condition
      const mergedItem = {
        ...currentItem,
        ...updatedItem,
        condition: (updatedItem.itemCondition as StationaryItem['condition']) || currentItem.condition,
      };
      const apiRequestBody = convertLocalToApi({
        name: mergedItem.name,
        quantity: mergedItem.quantity,
        category: mergedItem.category,
        location: mergedItem.location,
        condition: mergedItem.condition,
      });

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the items list after successful update
      await fetchItems();
      toast.success('Stationary item updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      toast.error(err instanceof Error ? err.message : 'Failed to update item');
      console.error('Error updating item:', err);
    }
  };

  // Delete item
  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the items list after successful deletion
      await fetchItems();
      toast.success('Stationary item deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      toast.error(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Error deleting item:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton />
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-center">
            <span>Error: {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ItemManagement
        title="Consumables"
        items={items.map(stationaryToItem)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        categories={categories}
      />
    </div>
  );
}