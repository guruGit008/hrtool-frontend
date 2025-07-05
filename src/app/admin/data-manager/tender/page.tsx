'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Search, Filter, Eye, ArrowLeft } from 'lucide-react';

import DataView, { ViewField } from '../components/DataView';
import Link from 'next/link';
import { APIURL } from '@/constants/api';

interface Tender {
  id: number;
  tenderNumber: string;
  title: string;
  organization: string;
  submissionDate: string;
  openingDate: string;
  estimatedValue: number;
  category: string;
  status: 'Open' | 'Closed' | 'Cancelled' | 'Awarded';
}

// API response type
interface TenderApi {
  id: number;
  tenderNumber: string;
  title: string;
  organization: string;
  submissionDate: string;
  openingDate: string;
  estimatedValue: string; // string from API
  category: string;
  status: 'Open' | 'Closed' | 'Cancelled' | 'Awarded';
}

const viewFields: ViewField[] = [
  { name: 'tenderNumber', label: 'Tender Number', type: 'text' },
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'organization', label: 'Organization', type: 'text' },
  { name: 'submissionDate', label: 'Submission Date', type: 'date' },
  { name: 'openingDate', label: 'Opening Date', type: 'date' },
  { name: 'estimatedValue', label: 'Estimated Value', type: 'currency' },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'status', label: 'Status', type: 'status' }
];

export default function TenderManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  // State for status filtering
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | Tender['status']>('all');


  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [data, setData] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = APIURL +`/api/tenders`;

  // --- Data Fetching (GET) ---
  const fetchTenders = useCallback(async () => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      // Ensure numerical values are correctly parsed if they might come as strings from API
      const processedResult = result.map((item: TenderApi) => ({
        ...item,
        estimatedValue: parseFloat(item.estimatedValue) || 0 // Convert to number, default to 0 if invalid
      })) as Tender[];
      setData(processedResult);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to fetch tenders: ${e.message}. Please check the server connection.`);
      } else {
        setError('Failed to fetch tenders: An unknown error occurred.');
      }
    } finally {
      setLoading(false); // **Crucial Fix: Always stop loading here**
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const handleExport = () => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    // Helper to properly quote CSV fields that might contain commas or newlines
    const escapeCsvField = (field: string | number) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`; // Escape internal quotes and wrap
      }
      return stringField;
    };

    const csvContent = "data:text/csv;charset=utf-8,"
      + "Tender Number,Title,Organization,Submission Date,Opening Date,Estimated Value,Category,Status\n"
      + data.map(item => [
        escapeCsvField(item.tenderNumber),
        escapeCsvField(item.title),
        escapeCsvField(item.organization),
        new Date(item.submissionDate).toLocaleDateString(), // Format date for CSV
        new Date(item.openingDate).toLocaleDateString(),   // Format date for CSV
        item.estimatedValue.toFixed(2), // Format amount for CSV
        escapeCsvField(item.category),
        escapeCsvField(item.status)
      ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tenders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (item: Tender) => {
    setSelectedTender(item);
    setIsViewOpen(true);
  };

  const filteredData = data.filter(item =>
    (item.tenderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.organization?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) // Added category to search
  ).filter(item => 
    selectedStatusFilter === 'all' || item.status === selectedStatusFilter
  ); // Apply status filter

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/data-manager"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Tender Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tender number, title, organization, or category..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setSelectedStatusFilter('all');
                    setShowFilter(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${selectedStatusFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                >
                  All Statuses
                </button>
                {(['Open', 'Closed', 'Cancelled', 'Awarded'] as Tender['status'][]).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatusFilter(status);
                      setShowFilter(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${selectedStatusFilter === status ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading tenders...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tender Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">No tenders found matching your criteria.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tenderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.organization}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.submissionDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.openingDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'Open' ? 'bg-green-100 text-green-800' :
                        item.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                        item.status === 'Awarded' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800' // For 'Cancelled'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isViewOpen && selectedTender && (
        <DataView
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedTender(null);
          }}
          data={selectedTender}
          fields={viewFields}
          title="Tender Details"
        />
      )}
    </div>
  );
}