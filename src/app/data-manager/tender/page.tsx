'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus,  Download, Search,  Eye, Edit, Trash2, } from 'lucide-react';
import DataForm, { FormField } from '../components/DataForm';
import DataView, { ViewField } from '../components/DataView';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

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



const formFields: FormField[] = [
  { name: 'tenderNumber', label: 'Tender Number', type: 'text', required: true },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'organization', label: 'Organization', type: 'text', required: true },
  { name: 'submissionDate', label: 'Submission Date', type: 'date', required: true },
  { name: 'openingDate', label: 'Opening Date', type: 'date', required: true },
  { name: 'estimatedValue', label: 'Estimated Value', type: 'number', required: true },
  { name: 'category', label: 'Category', type: 'select', options: ['Government', 'Private', 'International'], required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed', 'Cancelled', 'Awarded'], required: true }
];

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [data, setData] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = APIURL +'/api/tenders';

  // --- Data Fetching (GET) ---
  const fetchTenders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const mapped = result.map((item: Tender) => ({
        ...item,
        submissionDate: Array.isArray(item.submissionDate)
          ? `${item.submissionDate[0]}-${String(item.submissionDate[1]).padStart(2, '0')}-${String(item.submissionDate[2]).padStart(2, '0')}`
          : item.submissionDate,
        openingDate: Array.isArray(item.openingDate)
          ? `${item.openingDate[0]}-${String(item.openingDate[1]).padStart(2, '0')}-${String(item.openingDate[2]).padStart(2, '0')}`
          : item.openingDate
      }));
      setData(mapped);
    } catch (e: Error | unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Failed to fetch tenders: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const handleAddNew = () => {
    setSelectedTender(null);
    setIsFormOpen(true);
  };

  

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Tender Number,Title,Organization,Submission Date,Opening Date,Estimated Value,Category,Status\n"
      + data.map(item => [
        item.tenderNumber,
        item.title,
        item.organization,
        item.submissionDate,
        item.openingDate,
        item.estimatedValue,
        item.category,
        item.status
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

  const handleEdit = (item: Tender) => {
    setSelectedTender(item);
    setIsFormOpen(true);
  };

  // --- Data Deletion (DELETE) ---
  const handleDelete = async (item: Tender) => {
    if (confirm(`Are you sure you want to delete tender ${item.tenderNumber}?`)) {
      try {
        const response = await fetch(`${API_URL}/${item.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setData(prev => prev.filter(i => i.id !== item.id));
        toast.success('Tender deleted successfully!');
      } catch (e: Error | unknown) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        toast.error(`Failed to delete tender: ${errorMessage}`);
      }
    }
  };

  // --- Form Submission (POST/PUT) ---
  const handleFormSubmit = async (formData: Omit<Tender, 'id'>) => {
    try {
      if (selectedTender) {
        // Edit existing item (PUT)
        const response = await fetch(`${API_URL}/${selectedTender.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedTender = await response.json();
        setData(prev => prev.map(item =>
          item.id === selectedTender.id ? updatedTender : item
        ));
        toast.success('Tender updated successfully!');
      } else {
        // Add new item (POST)
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newTender = await response.json();
        setData(prev => [...prev, newTender]);
        toast.success('Tender added successfully!');
      }
      setIsFormOpen(false);
      setSelectedTender(null);
    } catch (e: Error | unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      toast.error(`Failed to save tender: ${errorMessage}`);
    }
  };

  const filteredData = data.filter(item =>
    (item.tenderNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.organization?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Tender Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </button>
         
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
            placeholder="Search by tender number, title, or organization..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
       
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading tenders...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <div className="w-full mt-6 bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full min-w-[1100px] divide-y divide-gray-200">
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
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">No tenders found.</td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tenderNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.organization}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.submissionDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.openingDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.estimatedValue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'Open' ? 'bg-green-100 text-green-800' :
                          item.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                          item.status === 'Awarded' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
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
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DataForm<Tender>
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedTender(null);
        }}
        onSubmit={handleFormSubmit}
        title={selectedTender ? 'Edit Tender' : 'Add Tender'}
        fields={formFields}
        initialData={selectedTender}
      />

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