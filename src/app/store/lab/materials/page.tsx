'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import BackButton from '@/app/components/BackButton';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface LabMaterial {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  itemCondition: string;
  lastUpdated: Date;
}

const API_BASE_URL = APIURL +`/store/lab/materials`;

export default function LabMaterialsPage() {
  const [materials, setMaterials] = useState<LabMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LabMaterial | null>(null);

  // State for new material form
  const [newMaterial, setNewMaterial] = useState<Omit<LabMaterial, 'id' | 'lastUpdated'>>({
    name: '',
    category: '',
    quantity: 0,
    location: '',
    itemCondition: 'New',
  });

  // Fetch materials from API on component mount
  useEffect(() => {
    const fetchMaterials = async () => {
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
        
        const data: LabMaterial[] = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }
        
        // Convert date strings to Date objects
        const processedData = data.map(material => ({
          ...material,
          lastUpdated: new Date(material.lastUpdated),
        }));
        
        setMaterials(processedData);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch materials');
        setMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Handle adding a new material
  const handleAdd = async () => {
    const newMaterialData = {
      ...newMaterial,
      lastUpdated: new Date().toISOString(),
    };

    try {
      setError(null);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterialData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add material: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const addedMaterial: LabMaterial = await response.json();
      setMaterials([...materials, { ...addedMaterial, lastUpdated: new Date(addedMaterial.lastUpdated) }]);
      setIsAddModalOpen(false);
      setNewMaterial({ name: '', category: '', quantity: 0, location: '', itemCondition: 'New' });
      toast.success('Material item added successfully!');
    } catch (error) {
      console.error('Error adding material:', error);
      setError(error instanceof Error ? error.message : 'Failed to add material');
      toast.error(error instanceof Error ? error.message : 'Failed to add material');
    }
  };

  // Handle opening the edit modal
  const handleEditClick = (material: LabMaterial) => {
    setEditingMaterial({
      ...material,
      lastUpdated: material.lastUpdated
    });
    setIsEditModalOpen(true);
  };

  // Handle updating a material
  const handleUpdate = async () => {
    if (!editingMaterial) return;

    const updatedMaterialData = {
      ...editingMaterial,
      lastUpdated: new Date().toISOString(),
    };

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${editingMaterial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMaterialData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update material: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const returnedMaterial: LabMaterial = await response.json();
      setMaterials(materials.map(m =>
        m.id === returnedMaterial.id ? { ...returnedMaterial, lastUpdated: new Date(returnedMaterial.lastUpdated) } : m
      ));
      setIsEditModalOpen(false);
      setEditingMaterial(null);
      toast.success('Material item updated successfully!');
    } catch (error) {
      console.error('Error updating material:', error);
      setError(error instanceof Error ? error.message : 'Failed to update material');
      toast.error(error instanceof Error ? error.message : 'Failed to update material');
    }
  };

  // Handle deleting a material
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete material: ${response.status} - ${errorData.message || response.statusText}`);
      }

      setMaterials(materials.filter(material => material.id !== id));
      toast.success('Material item deleted successfully!');
    } catch (error) {
      console.error('Error deleting material:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete material');
      toast.error(error instanceof Error ? error.message : 'Failed to delete material');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Laboratory Equipment Inventory
          </h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Material
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
        ) : materials.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No materials found
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
                {materials.map(material => (
                  <tr key={material.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.itemCondition}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {material.lastUpdated.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(material)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
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

        {/* Add Material Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Material</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={newMaterial.name}
                    onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <input
                    type="text"
                    id="category"
                    value={newMaterial.category}
                    onChange={e => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    value={newMaterial.quantity}
                    onChange={e => setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value) || 0 })}
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
                    value={newMaterial.location}
                    onChange={e => setNewMaterial({ ...newMaterial, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="itemCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                  <select
                    id="itemCondition"
                    value={newMaterial.itemCondition}
                    onChange={e => setNewMaterial({ ...newMaterial, itemCondition: e.target.value })}
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
                    setNewMaterial({ name: '', category: '', quantity: 0, location: '', itemCondition: 'New' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Material
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Material Modal */}
        {isEditModalOpen && editingMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Material</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    id="editName"
                    value={editingMaterial.name}
                    onChange={e => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <input
                    type="text"
                    id="editCategory"
                    value={editingMaterial.category}
                    onChange={e => setEditingMaterial({ ...editingMaterial, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    id="editQuantity"
                    value={editingMaterial.quantity}
                    onChange={e => setEditingMaterial({ ...editingMaterial, quantity: parseInt(e.target.value) || 0 })}
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
                    value={editingMaterial.location}
                    onChange={e => setEditingMaterial({ ...editingMaterial, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editItemCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                  <select
                    id="editItemCondition"
                    value={editingMaterial.itemCondition}
                    onChange={e => setEditingMaterial({ ...editingMaterial, itemCondition: e.target.value })}
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
                    setEditingMaterial(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Update Material
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 