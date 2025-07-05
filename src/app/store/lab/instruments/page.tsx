'use client';

import { useState, useEffect, useCallback } from 'react';
import ItemManagement from '@/app/components/ItemManagement';
import BackButton from '@/app/components/BackButton';
import type { Item } from '@/app/components/ItemManagement';
import { useRouter } from 'next/navigation';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface LabInstrument {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: Date;
  condition: 'new' | 'good' | 'fair' | 'poor';
  calibrationDate?: Date;
}

// API response interface to match backend structure
interface ApiLabInstrument {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  lastUpdated: string;
  itemCondition: string;
  calibrationDate?: string;
 
}

const API_BASE_URL = APIURL +'/store/lab/instruments';

// Move these functions outside the component to prevent recreation on every render
const mapCondition = (apiCondition: string): LabInstrument['condition'] => {
  const conditionMap: Record<string, LabInstrument['condition']> = {
    'New': 'new',
    'Good': 'good',
    'Fair': 'fair',
    'Poor': 'poor',
    'new': 'new',
    'good': 'good',
    'fair': 'fair',
    'poor': 'poor',
  };
  return conditionMap[apiCondition] || 'good';
};

const mapConditionToApi = (condition?: LabInstrument['condition']): string => {
  const conditionMap: Record<LabInstrument['condition'], string> = {
    'new': 'New',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor',
  };
  return condition ? conditionMap[condition] : 'Good';
};

// Transform API response to internal format
const transformApiToInternal = (apiItem: ApiLabInstrument): LabInstrument => ({
  id: apiItem.id || `instrument-${Math.random().toString(36).substr(2, 9)}`,
  name: apiItem.name,
  quantity: apiItem.quantity,
  category: apiItem.category,
  location: apiItem.location,
  lastUpdated: new Date(apiItem.lastUpdated),
  condition: mapCondition(apiItem.itemCondition),
  calibrationDate: apiItem.calibrationDate ? new Date(apiItem.calibrationDate) : undefined,
});

// Transform internal format to API format
const transformInternalToApi = (item: Partial<LabInstrument>) => ({
  name: item.name,
  quantity: item.quantity,
  category: item.category,
  location: item.location,
  itemCondition: mapConditionToApi(item.condition),
  lastUpdated: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  calibrationDate: item.calibrationDate?.toISOString().split('T')[0],
});

export default function LabInstrumentsPage() {
  const [items, setItems] = useState<LabInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();

  const categories = ['Optical', 'Separation', 'Measurement', 'Analysis', 'Electronics', 'Other'];

  // Check authentication only once on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  // Fetch all items from API - no dependencies that change on every render
  const fetchItems = useCallback(async () => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
      }
      
      const data: ApiLabInstrument[] = await response.json();
      const transformedItems = data.map(transformApiToInternal);
      setItems(transformedItems);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      setItems([]); // Ensure items are cleared on error
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  // Load items only once on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Helper to convert LabInstrument to Item for ItemManagement
  const labInstrumentToItem = useCallback((instrument: LabInstrument): Item => ({
    ...instrument,
    itemCondition: instrument.condition,
    purchaseDate: undefined,
    calibrationDate: instrument.calibrationDate,
    manufacturer: undefined,
    partNumber: undefined,
    expiryDate: undefined,
    supplier: undefined,
    model: undefined,
    serialNumber: undefined,
    lastMaintenance: undefined,
  }), []);

  // Add new item via API
  const handleAdd = useCallback(async (newItem: Omit<Item, 'id' | 'lastUpdated'>) => {
    try {
      setError(null);
      // Map itemCondition to condition
      const labInstrument: Omit<LabInstrument, 'id' | 'lastUpdated'> = {
        ...newItem,
        condition: newItem.itemCondition as LabInstrument['condition'],
        calibrationDate: newItem.calibrationDate,
      };
      const apiPayload = transformInternalToApi(labInstrument);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });
      if (!response.ok) {
        throw new Error(`Failed to add item: ${response.status} ${response.statusText}`);
      }
      const createdItem: ApiLabInstrument = await response.json();
      const transformedItem = transformApiToInternal(createdItem);
      setItems(prevItems => [...prevItems, transformedItem]);
      toast.success('Lab instrument added successfully!');
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add lab instrument';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Edit item via API
  const handleEdit = useCallback(async (id: string, updatedItem: Partial<Item>) => {
    try {
      setError(null);
      // Map itemCondition to condition
      const labInstrument: Partial<LabInstrument> = {
        ...updatedItem,
        condition: updatedItem.itemCondition as LabInstrument['condition'],
        calibrationDate: updatedItem.calibrationDate,
      };
      const apiPayload = transformInternalToApi(labInstrument);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT', // or 'PATCH' depending on your API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });
      if (!response.ok) {
        throw new Error(`Failed to update item: ${response.status} ${response.statusText}`);
      }
      const updatedApiItem: ApiLabInstrument = await response.json();
      const updatedItemTransformed = transformApiToInternal(updatedApiItem);
      setItems(prevItems => prevItems.map(item => item.id === id ? updatedItemTransformed : item));
      toast.success('Lab instrument updated successfully!');
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lab instrument';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Delete item via API
  const handleDelete = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status} ${response.statusText}`);
      }
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      toast.success('Lab instrument deleted successfully!');
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lab instrument';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Retry function for error recovery
  const handleRetry = useCallback(() => {
    setIsInitialLoad(true);
    fetchItems();
  }, [fetchItems]);

  if (isInitialLoad && loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading lab instruments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton />
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">API Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ItemManagement
        title="Lab Instruments"
        items={items.map(labInstrumentToItem)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        categories={categories}
      />
    </div>
  );
}