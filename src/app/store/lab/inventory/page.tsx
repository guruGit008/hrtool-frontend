'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import BackButton from '@/app/components/BackButton';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

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

const API_BASE_URL =APIURL + `/store/lab/inventory`;

export default function LabInventoryPage() {
  const [inventory, setInventory] = useState<LabInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LabInventory | null>(null);

  // Helper function to format [year, month, day] to 'YYYY-MM-DD' string
  const formatDateArrayToString = (dateArr: [number, number, number]) => {
    if (!Array.isArray(dateArr) || dateArr.length !== 3) return '';
    const [year, month, day] = dateArr;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Helper function to format Date to YYYY-MM-DD for input type="date"
  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse YYYY-MM-DD string to Date object in local timezone
  const parseDateInput = (dateString: string): Date => {
    if (!dateString) {
      return new Date(); // Default to current date if input is empty
    }
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date in local timezone to avoid UTC interpretation issues
    const d = new Date(year, month - 1, day);
    return !isNaN(d.getTime()) ? d : new Date(); // Return valid date or current date
  };

  // State for new inventory item form
  const [newItem, setNewItem] = useState<Omit<LabInventory, 'id'>>({
    item: '',
    category: '',
    quantity: 0,
    location: '',
    itemCondition: 'New',
    type: 'in',
    notes: '',
    date: [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()],
  });

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

  // Handle adding a new inventory item
  const handleAdd = async () => {
    try {
      if (!newItem.item || !newItem.category || newItem.quantity < 0) {
        throw new Error('Please fill in all required fields correctly');
      }
      const newItemData = {
        item: newItem.item,
        category: newItem.category,
        type: newItem.type.toUpperCase(),
        quantity: newItem.quantity,
        location: newItem.location,
        date: formatDateArrayToString(newItem.date),
        notes: newItem.notes,
      };
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add item: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const addedItem: LabInventory = await response.json();
      setInventory([...inventory, addedItem]);
      setIsAddModalOpen(false);
      setNewItem({
        item: '',
        category: '',
        quantity: 0,
        location: '',
        itemCondition: 'New',
        type: 'in',
        notes: '',
        date: [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()],
      });
      toast.success('Inventory item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      alert(`Error adding item: ${(error as Error).message}`);
      toast.error(error instanceof Error ? error.message : 'Failed to add item');
    }
  };

  // Handle opening the edit modal
  const handleEditClick = (item: LabInventory) => {
    setEditingItem({
      ...item,
      date: item.date,
    });
    setIsEditModalOpen(true);
  };

  // Handle updating an inventory item
  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      if (!editingItem.item || !editingItem.category || editingItem.quantity < 0) {
        throw new Error('Please fill in all required fields correctly');
      }
      const updatedItemData = {
        item: editingItem.item,
        category: editingItem.category,
        type: editingItem.type.toUpperCase(),
        quantity: editingItem.quantity,
        location: editingItem.location,
        date: formatDateArrayToString(editingItem.date),
        notes: editingItem.notes,
      };
      const response = await fetch(`${API_BASE_URL}/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItemData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update item: ${response.status} - ${errorData.message || response.statusText}`);
      }
      const returnedItem: LabInventory = await response.json();
      setInventory(inventory.map(i =>
        i.id === returnedItem.id ? returnedItem : i
      ));
      setIsEditModalOpen(false);
      setEditingItem(null);
      toast.success('Inventory item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert(`Error updating item: ${(error as Error).message}`);
      toast.error(error instanceof Error ? error.message : 'Failed to update item');
    }
  };

  // Handle deleting an inventory item
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete item: ${response.status} - ${errorData.message || response.statusText}`);
      }

      setInventory(inventory.filter(item => item.id !== id));
      toast.success('Inventory item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Error deleting item: ${(error as Error).message}`);
      toast.error(error instanceof Error ? error.message : 'Failed to delete item');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lab Inventory Management
          </h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Item
          </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Item Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Inventory Transaction</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="item" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name *</label>
                  <input
                    type="text"
                    id="item"
                    value={newItem.item}
                    onChange={e => setNewItem({ ...newItem, item: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                  <input
                    type="text"
                    id="category"
                    value={newItem.category}
                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity *</label>
                  <input
                    type="number"
                    id="quantity"
                    value={newItem.quantity}
                    onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={newItem.location}
                    onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <div>
                  <label htmlFor="itemCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                  <select
                    id="itemCondition"
                    value={newItem.itemCondition}
                    onChange={e => setNewItem({ ...newItem, itemCondition: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    id="type"
                    value={newItem.type}
                    onChange={e => setNewItem({ ...newItem, type: e.target.value as 'in' | 'out' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="in">In</option>
                    <option value="out">Out</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea
                    id="notes"
                    value={newItem.notes}
                    onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <input
                    type="date"
                    id="date"
                    value={formatDateToYYYYMMDD(new Date(newItem.date[0], newItem.date[1] - 1, newItem.date[2]))}
                    onChange={e => {
                      const parsedDate = parseDateInput(e.target.value);
                      setNewItem({ ...newItem, date: [parsedDate.getFullYear(), parsedDate.getMonth() + 1, parsedDate.getDate()] });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewItem({
                      item: '',
                      category: '',
                      quantity: 0,
                      location: '',
                      itemCondition: 'New',
                      type: 'in',
                      notes: '',
                      date: [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()],
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {isEditModalOpen && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Item</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editItem" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name *</label>
                  <input
                    type="text"
                    id="editItem"
                    value={editingItem.item}
                    onChange={e => setEditingItem({ ...editingItem, item: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                  <input
                    type="text"
                    id="editCategory"
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity *</label>
                  <input
                    type="number"
                    id="editQuantity"
                    value={editingItem.quantity}
                    onChange={e => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    type="text"
                    id="editLocation"
                    value={editingItem.location}
                    onChange={e => setEditingItem({ ...editingItem, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <div>
                  <label htmlFor="editItemCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                  <select
                    id="editItemCondition"
                    value={editingItem.itemCondition}
                    onChange={e => setEditingItem({ ...editingItem, itemCondition: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="editType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    id="editType"
                    value={editingItem.type}
                    onChange={e => setEditingItem({ ...editingItem, type: e.target.value as 'in' | 'out' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="in">In</option>
                    <option value="out">Out</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="editNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea
                    id="editNotes"
                    value={editingItem.notes}
                    onChange={e => setEditingItem({ ...editingItem, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <input
                    type="date"
                    id="date"
                    value={formatDateToYYYYMMDD(new Date(editingItem.date[0], editingItem.date[1] - 1, editingItem.date[2]))}
                    onChange={e => {
                      const parsedDate = parseDateInput(e.target.value);
                      setEditingItem({ ...editingItem, date: [parsedDate.getFullYear(), parsedDate.getMonth() + 1, parsedDate.getDate()] });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Update Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 