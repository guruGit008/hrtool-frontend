'use client';

import { useEffect, useState } from 'react';

import BackButton from '@/components/BackButton';
import { APIURL } from '@/constants/api';

interface TravelExpense {
  id: number;
  date: string;
  amount: number;
  description: string;
}

const API_URL =APIURL + '/api/travel';

const travelAPI = {
  getAll: async (): Promise<TravelExpense[]> => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch travel expenses');
    return res.json();
  },
};

function formatDate(dateString: string) {
  if (!dateString) return '';
  if (/^\d{8}$/.test(dateString)) {
    const str = dateString.padStart(8, '0');
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }
  const d = new Date(dateString);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return dateString;
}

export default function TravelPage() {
  const [expenses, setExpenses] = useState<TravelExpense[]>([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await travelAPI.getAll();
        setExpenses(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchExpenses();
  }, []);



  

  return (
    <div className="container mx-auto py-8">
      <BackButton href="/admin/finance-manager/dashboard" label="Back to Dashboard" />

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Travel Expenses</h1>

     

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Expense List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description / Purpose</th>
            
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{formatDate(expense.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">₹{expense.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.description}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
