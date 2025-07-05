'use client';

import { useEffect, useState, useCallback } from 'react';
import BackButton from '@/components/BackButton';
import { APIURL } from '@/constants/api';

interface WaterBillExpense {
  id: number;
  date: number[]; // API returns date as [year, month, day], e.g., [2025, 6, 28]
  amount: number;
  description: string;
}

export default function WaterBillsPage() {
  const [expenses, setExpenses] = useState<WaterBillExpense[]>([]);

  const API_URL = APIURL +'/api/water-bills';

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Fetch failed');
      setExpenses(await res.json());
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <div className="container mx-auto py-8">
      <BackButton href="/admin/finance-manager/dashboard" label="Back to Dashboard" />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Water Bills</h1>

      {/* Expense List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Expense List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-center divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="px-6 py-4">{new Date(e.date[0], e.date[1] - 1, e.date[2]).toLocaleDateString()}</td>
                  <td className="px-6 py-4">${e.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{e.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
