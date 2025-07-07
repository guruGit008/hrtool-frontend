'use client';

import { useEffect, useState } from 'react';
import { PlusCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import BackButton from '@/components/BackButton';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface ElectricBillExpense {
  id: number;
  date: number[]; // API returns date as [year, month, day]
  amount: number;
  description: string;
}

export default function ElectricBillsPage() {
  const [expenses, setExpenses] = useState<ElectricBillExpense[]>([]);
  const [newExpense, setNewExpense] = useState({ date: '', amount: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  // ✅ Fetch electric bills from backend
  useEffect(() => {
    fetch(APIURL +'/api/electric-bills')
      .then((res) => res.json())
      .then(setExpenses)
      .catch((err) => console.error('Error fetching bills:', err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  // Add a helper to count words for description
  const getDescWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const maxDescWords = 6;
  const warnDescWords = 5;
  const descWordCount = getDescWordCount(newExpense.description);

  // ✅ Add new electric bill (POST)
  const handleAddExpense = async () => {
    if (!newExpense.date || !newExpense.amount || !newExpense.description) return;
    try {
      // Convert the date string from the form (YYYY-MM-DD) to the array format
      const [year, month, day] = newExpense.date.split('-').map(Number);
      const res = await fetch(APIURL +'/api/electric-bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: [year, month, day],
          amount: parseFloat(newExpense.amount),
          description: newExpense.description,
        }),
      });
      const added = await res.json();
      setExpenses([...expenses, added]);
      setNewExpense({ date: '', amount: '', description: '' });
      toast.success('Electric bill added successfully');
    } catch (error) {
      console.error('Add error:', error);
      toast.error('Failed to add electric bill');
    }
  };

  // ✅ Delete electric bill (DELETE)
  const handleDeleteExpense = async (id: number) => {
    try {
      await fetch(APIURL +`/api/electric-bills/${id}`, { method: 'DELETE' });
      setExpenses(expenses.filter(exp => exp.id !== id));
      toast.success('Electric bill deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete electric bill');
    }
  };

  const handleEditClick = (expense: ElectricBillExpense) => {
    setEditingId(expense.id);
    // Convert the date array to YYYY-MM-DD format for the input
    const dateStr = `${expense.date[0]}-${String(expense.date[1]).padStart(2, '0')}-${String(expense.date[2]).padStart(2, '0')}`;
    setNewExpense({
      date: dateStr,
      amount: expense.amount.toString(),
      description: expense.description,
    });
  };

  // ✅ Update electric bill (PUT)
  const handleUpdateExpense = async () => {
    if (!newExpense.date || !newExpense.amount || !newExpense.description || editingId === null) return;
    try {
      // Convert the date string from the form (YYYY-MM-DD) to the array format
      const [year, month, day] = newExpense.date.split('-').map(Number);
      const res = await fetch(APIURL +`/api/electric-bills/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: [year, month, day],
          amount: parseFloat(newExpense.amount),
          description: newExpense.description,
        }),
      });
      const updated = await res.json();
      setExpenses(expenses.map(exp => exp.id === editingId ? updated : exp));
      setNewExpense({ date: '', amount: '', description: '' });
      setEditingId(null);
      toast.success('Electric bill updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update electric bill');
    }
  };

  const handleCancelEdit = () => {
    setNewExpense({ date: '', amount: '', description: '' });
    setEditingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton href="/finance-manager/dashboard" label="Back to Dashboard" />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Electric Bills</h1>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{editingId ? 'Edit' : 'Add New'} Electric Bill</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input type="date" name="date" value={newExpense.date} onChange={handleInputChange}
            className="p-2 border rounded-md dark:bg-gray-700 dark:text-white" />
          <input type="number" name="amount" value={newExpense.amount} onChange={handleInputChange}
            className="p-2 border rounded-md dark:bg-gray-700 dark:text-white" />
          <input
            type="text"
            name="description"
            placeholder="Description (max 6 words)"
            value={newExpense.description}
            onChange={e => {
              const words = e.target.value.trim().split(/\s+/).filter(Boolean);
              if (words.length <= maxDescWords) {
                setNewExpense({ ...newExpense, description: e.target.value });
              } else {
                setNewExpense({ ...newExpense, description: words.slice(0, maxDescWords).join(' ') });
              }
            }}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
          <div className="text-xs mt-1 mb-2">
            <span className={`${descWordCount > warnDescWords ? (descWordCount > maxDescWords ? 'text-red-600' : 'text-yellow-600') : 'text-gray-500'}`}>Word count: {descWordCount} / {maxDescWords}</span>
            {descWordCount > maxDescWords && <span className="text-xs text-red-600 ml-2">Maximum 6 words allowed</span>}
          </div>
        </div>
        <div className="flex space-x-4">
          {editingId ? (
            <>
              <button
                onClick={handleUpdateExpense}
                disabled={descWordCount > maxDescWords}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" /> Update
              </button>
              <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-400 text-white rounded-md">Cancel</button>
            </>
          ) : (
            <button
              onClick={handleAddExpense}
              disabled={descWordCount > maxDescWords}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" /> Add
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Expense List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4">{new Date(expense.date[0], expense.date[1] - 1, expense.date[2]).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{expense.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{expense.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEditClick(expense)} className="text-blue-600 mr-4">Edit</button>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
