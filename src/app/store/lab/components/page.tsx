'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import BackButton from '@/app/components/BackButton';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface LabComponent {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  itemCondition: string;
  lastUpdated: Date;
}

const API_BASE_URL = APIURL + `/store/lab/components`;

export default function LabComponentsPage() {
  const [components, setComponents] = useState<LabComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<LabComponent | null>(null);

  // State for new component form
  const [newComponent, setNewComponent] = useState<Omit<LabComponent, 'id' | 'lastUpdated'>>({
    name: '',
    category: '',
    quantity: 0,
    location: '',
    itemCondition: 'New',
  });

  // Fetch components from API on component mount
  useEffect(() => {
    const fetchComponents = async () => {
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
        
        const data: LabComponent[] = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }
        
        // Convert date strings to Date objects
        const processedData = data.map(component => ({
          ...component,
          lastUpdated: new Date(component.lastUpdated),
        }));
        
        setComponents(processedData);
      } catch (error) {
        console.error('Error fetching components:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch components');
        setComponents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComponents();
  }, []);

  // Handle adding a new component
  const handleAdd = async () => {
    const newComponentData = {
      ...newComponent,
      lastUpdated: new Date().toISOString(),
    };

    try {
      setError(null);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComponentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add component: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const addedComponent: LabComponent = await response.json();
      setComponents([...components, { ...addedComponent, lastUpdated: new Date(addedComponent.lastUpdated) }]);
      setIsAddModalOpen(false);
      setNewComponent({ name: '', category: '', quantity: 0, location: '', itemCondition: 'New' });
      toast.success('Component item added successfully!');
    } catch (error) {
      console.error('Error adding component:', error);
      setError(error instanceof Error ? error.message : 'Failed to add component');
      toast.error(error instanceof Error ? error.message : 'Failed to add component');
    }
  };

  // Handle opening the edit modal
  const handleEditClick = (component: LabComponent) => {
    setEditingComponent({
      ...component,
      lastUpdated: component.lastUpdated
    });
    setIsEditModalOpen(true);
  };

  // Handle updating a component
  const handleUpdate = async () => {
    if (!editingComponent) return;

    const updatedComponentData = {
      ...editingComponent,
      lastUpdated: new Date().toISOString(),
    };

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${editingComponent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedComponentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update component: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const returnedComponent: LabComponent = await response.json();
      setComponents(components.map(c =>
        c.id === returnedComponent.id ? { ...returnedComponent, lastUpdated: new Date(returnedComponent.lastUpdated) } : c
      ));
      setIsEditModalOpen(false);
      setEditingComponent(null);
      toast.success('Component item updated successfully!');
    } catch (error) {
      console.error('Error updating component:', error);
      setError(error instanceof Error ? error.message : 'Failed to update component');
      toast.error(error instanceof Error ? error.message : 'Failed to update component');
    }
  };

  // Handle deleting a component
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this component?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete component: ${response.status} - ${errorData.message || response.statusText}`);
      }

      setComponents(components.filter(component => component.id !== id));
      toast.success('Component item deleted successfully!');
    } catch (error) {
      console.error('Error deleting component:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete component');
      toast.error(error instanceof Error ? error.message : 'Failed to delete component');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lab Components Inventory
          </h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Component
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
        ) : components.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No components found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {components.map(component => (
                  <tr key={component.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{component.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{component.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{component.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{component.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{component.itemCondition}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {component.lastUpdated.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(component)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(component.id)}
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

        {/* Add Component Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Component</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={newComponent.name}
                    onChange={e => setNewComponent({ ...newComponent, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <input
                    type="text"
                    id="category"
                    value={newComponent.category}
                    onChange={e => setNewComponent({ ...newComponent, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    value={newComponent.quantity}
                    onChange={e => setNewComponent({ ...newComponent, quantity: parseInt(e.target.value) || 0 })}
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
                    value={newComponent.location}
                    onChange={e => setNewComponent({ ...newComponent, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="itemCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                  <select
                    id="itemCondition"
                    value={newComponent.itemCondition}
                    onChange={e => setNewComponent({ ...newComponent, itemCondition: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewComponent({ name: '', category: '', quantity: 0, location: '', itemCondition: 'New' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Component
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Component Modal */}
        {isEditModalOpen && editingComponent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Component</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    id="editName"
                    value={editingComponent.name}
                    onChange={e => setEditingComponent({ ...editingComponent, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <input
                    type="text"
                    id="editCategory"
                    value={editingComponent.category}
                    onChange={e => setEditingComponent({ ...editingComponent, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    id="editQuantity"
                    value={editingComponent.quantity}
                    onChange={e => setEditingComponent({ ...editingComponent, quantity: parseInt(e.target.value) || 0 })}
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
                    value={editingComponent.location}
                    onChange={e => setEditingComponent({ ...editingComponent, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editItemCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                  <select
                    id="editItemCondition"
                    value={editingComponent.itemCondition}
                    onChange={e => setEditingComponent({ ...editingComponent, itemCondition: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingComponent(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Update Component
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 