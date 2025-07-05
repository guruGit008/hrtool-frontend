'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Import PencilIcon and TrashIcon
import BackButton from '@/app/components/BackButton';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface InventoryTransaction {
  id: string;
  item: string;
  type: 'in' | 'out';
  quantity: number;
  date: Date;
  location: string;
  notes: string;
}

const API_BASE_URL =APIURL + `/store/stationary/inventory`;

export default function StationaryInventoryPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal visibility
  const [editingTransaction, setEditingTransaction] = useState<InventoryTransaction | null>(null); // State to hold the transaction being edited

  // State for new transaction form (used by Add Modal)
  const [newTransaction, setNewTransaction] = useState<Omit<InventoryTransaction, 'id' | 'date'>>({
    item: '',
    type: 'in',
    quantity: 0,
    location: '',
    notes: '',
  });

  // Fetch transactions from API on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching transactions...');
        const response = await fetch(API_BASE_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
        }
        
        const data: InventoryTransaction[] = await response.json();
        console.log('Fetched data:', data);
        
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data);
          throw new Error('Invalid data format received from API');
        }
        
        // Convert date strings from API to Date objects
        const processedData = data.map(transaction => ({
          ...transaction,
          date: new Date(transaction.date),
        }));
        console.log('Processed data:', processedData);
        setTransactions(processedData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle adding a new transaction via API (POST)
  const handleAdd = async () => {
    const newTransactionData = {
      ...newTransaction,
      date: new Date().toISOString(), // Send date as ISO string to API
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add transaction: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const addedTransaction: InventoryTransaction = await response.json();
      // Add the new transaction to the state, converting its date back to a Date object
      setTransactions([...transactions, { ...addedTransaction, date: new Date(addedTransaction.date) }]);
      setIsAddModalOpen(false); // Close modal
      setNewTransaction({ item: '', type: 'in', quantity: 0, location: '', notes: '' }); // Reset form fields
      toast.success('Inventory item added successfully!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert(`Error adding transaction: ${(error as Error).message}`); // Inform user about the error
      toast.error(error instanceof Error ? error.message : 'Failed to add item');
    }
  };

  // Handle opening the edit modal and pre-filling it with transaction data
  const handleEditClick = (transaction: InventoryTransaction) => {
    setEditingTransaction({
      id: transaction.id,
      item: transaction.item || '',
      type: transaction.type || 'in',
      quantity: transaction.quantity || 0,
      location: transaction.location || '',
      notes: transaction.notes || '',
      date: transaction.date
    });
    setIsEditModalOpen(true);
  };

  // Handle updating an existing transaction via API (PUT)
  const handleUpdate = async () => {
    if (!editingTransaction) return; // Should not happen if modal is open

    const updatedTransactionData = {
      ...editingTransaction,
      date: editingTransaction.date.toISOString(), // Ensure date is ISO string for API
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${editingTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTransactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update transaction: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const returnedTransaction: InventoryTransaction = await response.json(); // API might return the updated object
      // Update the transaction in the state
      setTransactions(transactions.map(t =>
        t.id === returnedTransaction.id ? { ...returnedTransaction, date: new Date(returnedTransaction.date) } : t
      ));
      setIsEditModalOpen(false); // Close modal
      setEditingTransaction(null); // Clear editing state
      toast.success('Inventory item updated successfully!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert(`Error updating transaction: ${(error as Error).message}`);
      toast.error(error instanceof Error ? error.message : 'Failed to update item');
    }
  };

  // Handle deleting a transaction via API (DELETE)
  const handleDelete = async (id: string) => {
    // Confirmation dialog before deleting
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete transaction: ${response.status} - ${errorData.message || response.statusText}`);
      }

      // Filter out the deleted transaction from the state
      setTransactions(transactions.filter(transaction => transaction.id !== id));
      toast.success('Inventory item deleted successfully!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert(`Error deleting transaction: ${(error as Error).message}`);
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
            Office Supplies Inventory Transactions
          </h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Transaction
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
        ) : transactions.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  {/* Changed from Notes to Actions */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.item}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'in' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {transaction.type === 'in' ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
                       {(transaction?.type ?? '').toUpperCase()}

                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(transaction.date).toLocaleDateString()}</td>
                    {/* Action buttons with icons */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(transaction)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
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

        {/* Add Transaction Modal (Existing) */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Transaction</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="item" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                  <input
                    type="text"
                    id="item"
                    value={newTransaction.item}
                    onChange={e => setNewTransaction({ ...newTransaction, item: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction Type</label>
                  <select
                    id="type"
                    value={newTransaction.type}
                    onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value as 'in' | 'out' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="in">In</option>
                    <option value="out">Out</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    value={newTransaction.quantity}
                    onChange={e => setNewTransaction({ ...newTransaction, quantity: parseInt(e.target.value) || 0 })}
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
                    value={newTransaction.location}
                    onChange={e => setNewTransaction({ ...newTransaction, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea
                    id="notes"
                    value={newTransaction.notes}
                    onChange={e => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewTransaction({ item: '', type: 'in', quantity: 0, location: '', notes: '' }); // Reset form on cancel
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Transaction
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Transaction Modal (New) */}
        {isEditModalOpen && editingTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Transaction</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editItemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                  <input
                    type="text"
                    id="editItemName"
                    value={editingTransaction.item}
                    onChange={e => setEditingTransaction({ ...editingTransaction, item: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="editType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction Type</label>
                  <select
                    id="editType"
                    value={editingTransaction.type}
                    onChange={e => setEditingTransaction({ ...editingTransaction, type: e.target.value as 'in' | 'out' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="in">In</option>
                    <option value="out">Out</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    id="editQuantity"
                    value={editingTransaction.quantity}
                    onChange={e => setEditingTransaction({ ...editingTransaction, quantity: parseInt(e.target.value) || 0 })}
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
                    value={editingTransaction.location}
                    onChange={e => setEditingTransaction({ ...editingTransaction, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <div>
                  <label htmlFor="editNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea
                    id="editNotes"
                    value={editingTransaction.notes}
                    onChange={e => setEditingTransaction({ ...editingTransaction, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTransaction(null); // Clear editing state on cancel
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Update Transaction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}