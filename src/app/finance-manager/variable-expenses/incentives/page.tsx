'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircleIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import BackButton from '@/components/BackButton';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface IncentiveExpense {
  id: number;
  date: number[]; // API returns date as [year, month, day]
  amount: number;
  recipient: string;
  description: string;
}

export default function IncentivesPage() {
  const [expenses, setExpenses] = useState<IncentiveExpense[]>([]);
  const [newExpense, setNewExpense] = useState({ date: '', amount: '', recipient: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const BASE_URL = APIURL +'/api/incentives';

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch(BASE_URL);
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching incentives:', error);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  // Add a helper to count words for description
  const getDescWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const maxDescWords = 6;
  const warnDescWords = 5;
  const descWordCount = getDescWordCount(newExpense.description);

  const handleAddExpense = async () => {
    if (!newExpense.date || !newExpense.amount || !newExpense.recipient || !newExpense.description) {
      alert('Please fill out all fields before submitting.');
      return;
    }

    const [year, month, day] = newExpense.date.split('-').map(Number);
    const expenseToAdd = {
      date: [year, month, day],
      amount: parseFloat(newExpense.amount),
      recipient: newExpense.recipient,
      description: newExpense.description,
    };

    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseToAdd),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        fetchExpenses();
        setNewExpense({ date: '', amount: '', recipient: '', description: '' });
        toast.success('Incentive added successfully!');
      } else {
        alert('Failed to add incentive. Status: ' + res.status + '\n' + (result?.message || JSON.stringify(result)));
        console.error('Add incentive error:', result);
      }
    } catch (error) {
      alert('Network or server error. See console for details.');
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchExpenses();
      toast.success('Incentive deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEditClick = (expense: IncentiveExpense) => {
    setEditingId(expense.id);
    const dateStr = `${expense.date[0]}-${String(expense.date[1]).padStart(2, '0')}-${String(expense.date[2]).padStart(2, '0')}`;
    setNewExpense({ 
      date: dateStr || '',
      amount: expense.amount?.toString() || '',
      recipient: expense.recipient || '',
      description: expense.description || ''
    });
  };

  const handleUpdateExpense = async () => {
    if (!newExpense.date || !newExpense.amount || !newExpense.recipient || !newExpense.description || editingId === null) return;

    const [year, month, day] = newExpense.date.split('-').map(Number);
    const updatedExpense = {
      id: editingId,
      date: [year, month, day],
      amount: parseFloat(newExpense.amount),
      recipient: newExpense.recipient,
      description: newExpense.description,
    };

    try {
      const res = await fetch(`${BASE_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExpense),
      });
      if (res.ok) {
        fetchExpenses();
        setNewExpense({ date: '', amount: '', recipient: '', description: '' });
        setEditingId(null);
        toast.success('Incentive updated successfully!');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleCancelEdit = () => {
    setNewExpense({ date: '', amount: '', recipient: '', description: '' });
    setEditingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <BackButton href="/finance-manager/dashboard" label="Back to Dashboard" />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Incentives Expenses</h1>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {editingId ? 'Edit Incentive Entry' : 'Add New Incentive Entry'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input type="date" name="date" value={newExpense.date || ''} onChange={handleInputChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
          <input type="text" name="recipient" value={newExpense.recipient || ''} placeholder="Recipient" onChange={handleInputChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
          <input type="number" name="amount" value={newExpense.amount || ''} placeholder="Amount" onChange={handleInputChange} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
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
                onClick={editingId ? handleUpdateExpense : handleAddExpense}
                disabled={descWordCount > maxDescWords}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" /> Update Entry
              </button>
              <button onClick={handleCancelEdit} className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={editingId ? handleUpdateExpense : handleAddExpense}
              disabled={descWordCount > maxDescWords}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Entry
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Incentive List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {new Date(expense.date[0], expense.date[1] - 1, expense.date[2]).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.recipient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditClick(expense)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600 mr-4">
                      <PencilSquareIcon className="h-5 w-5 inline" /> Edit
                    </button>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600">
                      <TrashIcon className="h-5 w-5 inline" /> Delete
                    </button>
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
