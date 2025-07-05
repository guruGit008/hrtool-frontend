'use client';

import { useEffect, useState, useCallback } from 'react';

import BackButton from '@/components/BackButton';
import { APIURL } from '@/constants/api';

interface SalaryExpense {
  id: number;
  employeeName: string;
  date: number[]; // API returns date as [year, month, day]
  amount: number;
  description: string;
}

export default function SalariesPage() {
  const [expenses, setExpenses] = useState<SalaryExpense[]>([]);
  const API_URL =APIURL + '/api/salaries';

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setExpenses(data);
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

      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Salaries Expenses</h1>

    

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Salary List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.map(expense => (
                <tr key={expense.id}>
                  <td className="px-6 py-4">{expense.employeeName}</td>
                  <td className="px-6 py-4">{new Date(expense.date[0], expense.date[1] - 1, expense.date[2]).toLocaleDateString()}</td>
                  <td className="px-6 py-4">${expense.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{expense.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
