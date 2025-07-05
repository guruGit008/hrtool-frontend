'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Search, Filter, Eye, ArrowLeft } from 'lucide-react';

import DataView, { ViewField } from '../components/DataView';
import Link from 'next/link';
import { APIURL } from '@/constants/api';

interface LogisticsDocument {
  id: number;
  documentType: string;
  reference: string;
  date: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Completed';
  origin: string;
  destination: string;
  carrier: string;
}

const viewFields: ViewField[] = [
  { name: 'documentType', label: 'Document Type', type: 'text' },
  { name: 'reference', label: 'Reference Number', type: 'text' },
  { name: 'date', label: 'Document Date', type: 'date' },
  { name: 'status', label: 'Status', type: 'status' },
  { name: 'origin', label: 'Origin', type: 'text' },
  { name: 'destination', label: 'Destination', type: 'text' },
  { name: 'carrier', label: 'Carrier', type: 'text' }
];

export default function LogisticsDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false); // This state isn't currently used in the UI for filtering

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LogisticsDocument | null>(null);
  const [data, setData] = useState<LogisticsDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = APIURL +'/api/logisticsdocuments';

  // --- Data Fetching (GET) ---
  const fetchDocuments = useCallback(async () => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to fetch logistics documents: ${e.message}`); // More specific error message
      } else {
        setError('Failed to fetch logistics documents: An unknown error occurred.');
      }
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleExport = () => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8,"
      + "Document Type,Reference,Document Date,Status,Origin,Destination,Carrier\n" // Ensure headers match viewFields and are clear
      + data.map(item => [
        `"${item.documentType}"`, // Enclose with quotes to handle commas
        `"${item.reference}"`,   // Enclose with quotes
        new Date(item.date).toLocaleDateString(), // Format date for CSV
        item.status,
        `"${item.origin}"`,      // Enclose with quotes
        `"${item.destination}"`, // Enclose with quotes
        `"${item.carrier}"`      // Enclose with quotes
      ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "logistics_documents.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (item: LogisticsDocument) => {
    setSelectedDocument(item);
    setIsViewOpen(true);
  };

  const filteredData = data.filter(item =>
    (item.documentType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.origin?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.carrier?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

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
        <h2 className="text-2xl font-bold text-gray-900">Logistics Documents</h2>
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
            placeholder="Search by document type, reference, origin, destination, or carrier..."
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
          {/* You might want to implement an actual filter UI here, possibly a dropdown or a modal */}
          {showFilter && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              {/* Filter options would go here */}
              <div className="py-1">
                <p className="text-gray-700 px-4 py-2">Filter options to be implemented</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading logistics documents...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No logistics documents found.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.documentType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'Active' ? 'bg-green-100 text-green-800' :
                        item.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800' // Default for 'Completed' or any other status
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.origin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.carrier}</td>
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

      {isViewOpen && selectedDocument && (
        <DataView
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedDocument(null);
          }}
          data={selectedDocument}
          fields={viewFields}
          title="Logistics Document Details"
        />
      )}
    </div>
  );
}