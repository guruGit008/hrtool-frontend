'use client';
import React, { useState, useEffect } from 'react';
import { Search, Filter,  Eye,  X, Laptop, Package } from 'lucide-react';
import { APIURL } from '@/constants/api';

interface Asset {
  id?: number;
  assetName: string;
  category: string;
  serialNumber: string;
  status: string;
  assetcondition: string;
  assignedTo?: string | null;
}

const API_BASE_URL = APIURL +'/api';

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<Partial<Asset>>({
    assetName: '',
    category: '',
    serialNumber: '',
    status: 'Available',
    assetcondition: 'New',
    assignedTo: ''
  });

  // Fetch all assets
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/assets`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      const data = await response.json();
      // Ensure the data is an array
      setAssets(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAssets([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Retired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'Poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openModal = (type: 'add' | 'edit' | 'view', asset?: Asset) => {
    setModalType(type);
    setSelectedAsset(asset || null);
    if (type === 'add') {
      setFormData({
        assetName: '',
        category: '',
        serialNumber: '',
        status: 'Available',
        assetcondition: 'New',
        assignedTo: ''
      });
    } else if (asset) {
      setFormData({ ...asset });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.assetName || !formData.category || !formData.serialNumber || 
          !formData.status || !formData.assetcondition) {
        alert('Please fill in all required fields');
        return;
      }

      // Create the asset data with required fields
      const assetData = {
        assetName: formData.assetName,
        category: formData.category,
        serialNumber: formData.serialNumber,
        status: formData.status,
        assetcondition: formData.assetcondition,
        assignedTo: formData.assignedTo || null
      };

      if (modalType === 'add') {
        const response = await fetch(`${API_BASE_URL}/assets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assetData),
        });

        if (!response.ok) {
          throw new Error('Failed to add asset');
        }

        const newAsset = await response.json();
        setAssets(prev => [...prev, newAsset]);
      } else if (modalType === 'edit' && selectedAsset?.id) {
        const response = await fetch(`${API_BASE_URL}/assets/${selectedAsset.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...assetData,
            id: selectedAsset.id
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update asset');
        }

        const updatedAsset = await response.json();
        setAssets(prev => prev.map(asset => 
          asset.id === selectedAsset.id ? updatedAsset : asset
        ));
      }
      
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      alert('Failed to save asset. Please try again.');
    }
  };

 

  const filteredAssets = assets.filter(asset =>
    (asset.assetName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (asset.category?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (asset.serialNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading assets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
       
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id || asset.serialNumber} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Laptop className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                {asset.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{asset.assetName}</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Category:</span> {asset.category}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Serial Number:</span> {asset.serialNumber}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Condition:</span>{' '}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(asset.assetcondition)}`}>
                  {asset.assetcondition}
                </span>
              </p>
              {asset.assignedTo && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Assigned To:</span> {asset.assignedTo}
                </p>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => openModal('view', asset)}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
            
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                 
                  {modalType === 'view' && 'Asset Details'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {modalType === 'view' ? (
                <div className="py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Asset Name with Icon */}
                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-start h-full">
                      <div className="flex items-center mb-2">
                        <Package className="w-6 h-6 text-blue-500 mr-2" />
                        <span className="text-lg font-semibold text-gray-800">{selectedAsset?.assetName}</span>
                      </div>
                      <span className="text-xs text-gray-500">Asset Name</span>
                    </div>
                    {/* Category */}
                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-start h-full">
                      <span className="text-lg font-semibold text-gray-800 mb-1">{selectedAsset?.category}</span>
                      <span className="text-xs text-gray-500">Category</span>
                    </div>
                    {/* Serial Number */}
                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-start h-full">
                      <span className="text-lg font-semibold text-gray-800 mb-1">{selectedAsset?.serialNumber}</span>
                      <span className="text-xs text-gray-500">Serial Number</span>
                    </div>
                    {/* Status */}
                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-start h-full">
                      <span className={`text-lg font-semibold mb-1 ${getStatusColor(selectedAsset?.status || '')}`}>{selectedAsset?.status}</span>
                      <span className="text-xs text-gray-500">Status</span>
                    </div>
                    {/* Condition */}
                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-start h-full">
                      <span className={`text-lg font-semibold mb-1 ${getConditionColor(selectedAsset?.assetcondition || '')}`}>{selectedAsset?.assetcondition}</span>
                      <span className="text-xs text-gray-500">Condition</span>
                    </div>
                    {/* Assigned To */}
                    {selectedAsset?.assignedTo && (
                      <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-start h-full">
                        <span className="text-lg font-semibold text-gray-800 mb-1">{selectedAsset.assignedTo}</span>
                        <span className="text-xs text-gray-500">Assigned To</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.assetName || ''}
                        onChange={(e) => setFormData({...formData, assetName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.serialNumber || ''}
                        onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.status || ''}
                        onChange={(e) => setFormData({...formData, status: e.target.value as Asset['status']})}
                      >
                        <option value="">Select Status</option>
                        <option value="Available">Available</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.assetcondition || ''}
                        onChange={(e) => setFormData({...formData, assetcondition: e.target.value as Asset['assetcondition']})}
                      >
                        <option value="">Select Condition</option>
                        <option value="New">New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.assignedTo || ''}
                        onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                        placeholder="Leave empty if not assigned"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {modalType === 'add' ? 'Add Asset' : 'Update Asset'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 