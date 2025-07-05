'use client';
import { useState, useEffect, useCallback } from 'react';
import ItemManagement from '@/app/components/ItemManagement';
import BackButton from '@/app/components/BackButton';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface FixedItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: Date;
  itemCondition: 'new' | 'good' | 'fair' | 'poor';
}

interface ApiFixedItem {
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

const API_BASE_URL = APIURL +`/store/stationary/fixed`;

export default function FixedStationaryPage() {
  const [items, setItems] = useState<FixedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Furniture', 'Equipment', 'Storage', 'Other'];

  // Helper function to convert API response to local format
  const convertApiToLocal = (apiItem: ApiFixedItem): FixedItem => {
    // Handle potential null/undefined apiItem
    if (!apiItem) {
      throw new Error('Invalid item data received from API');
    }
    
    // Handle date conversion with fallback
    let lastUpdated = new Date();
    if (apiItem.lastUpdated && Array.isArray(apiItem.lastUpdated) && apiItem.lastUpdated.length >= 3) {
      const [year, month, day] = apiItem.lastUpdated;
      lastUpdated = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    }
    
    return {
      id: apiItem.id?.toString() || 'unknown',
      name: apiItem.name || 'Unknown Item',
      quantity: apiItem.quantity || 0,
      category: apiItem.category || 'Other',
      location: apiItem.location || 'Unknown Location',
      lastUpdated: lastUpdated,
      itemCondition: (apiItem.itemCondition?.toLowerCase() as 'new' | 'good' | 'fair' | 'poor') || 'good',
    };
  };

  // Helper function to convert local format to API request
  const convertLocalToApi = (localItem: Omit<FixedItem, 'id' | 'lastUpdated'>): ApiRequestBody => {
    const today = new Date();
    return {
      name: localItem.name,
      category: localItem.category,
      quantity: localItem.quantity,
      location: localItem.location,
      itemCondition: localItem.itemCondition.charAt(0).toUpperCase() + localItem.itemCondition.slice(1),
      lastUpdated: today.toISOString().split('T')[0], // YYYY-MM-DD format
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
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Check if data is null, undefined, or not an array
      if (!data) {
        console.log('API returned null/undefined data');
        setItems([]);
        return;
      }
      
      if (!Array.isArray(data)) {
        console.log('API returned non-array data:', typeof data);
        setItems([]);
        return;
      }
      
      const convertedItems = data.map(convertApiToLocal);
      setItems(convertedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error('Error fetching items:', err);
      setItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Add new item
  const handleAdd = async (newItem: Omit<FixedItem, 'id' | 'lastUpdated'>) => {
    try {
      setError(null);
      const apiRequestBody = convertLocalToApi(newItem);
      
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
      toast.success('Fixed stationary item added successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      toast.error(err instanceof Error ? err.message : 'Failed to add item');
      console.error('Error adding item:', err);
    }
  };

  // Edit existing item
  const handleEdit = async (id: string, updatedItem: Partial<FixedItem>) => {
    try {
      setError(null);
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) {
        throw new Error('Item not found');
      }

      // Merge current item with updates
      const mergedItem = { ...currentItem, ...updatedItem };
      const apiRequestBody = convertLocalToApi({
        name: mergedItem.name,
        quantity: mergedItem.quantity,
        category: mergedItem.category,
        location: mergedItem.location,
        itemCondition: mergedItem.itemCondition,
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
      toast.success('Fixed stationary item updated successfully!');
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
      toast.success('Fixed stationary item deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      toast.error(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Error deleting item:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster position="top-right" />
        <BackButton />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading fixed items...</div>
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
        title="Fixed Assets"
        items={items}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        categories={categories}
      />
    </div>
  );
}