'use client';
import React, { useEffect, useState } from 'react';
import { Laptop, Smartphone, CreditCard, Car, Wifi, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APIURL } from '@/constants/api';

interface Asset {
  id: number;
  name: string;
  type: 'laptop' | 'phone' | 'sim' | 'idCard' | 'vehicle';
  assignedDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'maintenance';
  serialNumber: string;
  condition: 'good' | 'fair' | 'poor';
  notes?: string;
}

interface ApiAsset {
  id: number;
  assetName: string;
  category: string;
  serialNumber: string;
  status: string;
  assetcondition: string;
  assignedTo?: string;
}

const API_BASE_URL = APIURL + '/api/assets';

function mapApiAssetToAsset(api: ApiAsset): Asset {
  // Map API status/condition to local enums
  let status: Asset['status'] = 'active';
  if (api.status === 'Under Maintenance') status = 'maintenance';
  else if (api.status === 'Returned') status = 'returned';
  else if (api.status === 'Available' || api.status === 'Assigned') status = 'active';

  let condition: Asset['condition'] = 'good';
  if (api.assetcondition === 'Fair') condition = 'fair';
  else if (api.assetcondition === 'Poor') condition = 'poor';
  else if (api.assetcondition === 'Good' || api.assetcondition === 'New') condition = 'good';

  // Map category to type
  let type: Asset['type'] = 'laptop';
  if (api.category.toLowerCase().includes('phone')) type = 'phone';
  else if (api.category.toLowerCase().includes('sim')) type = 'sim';
  else if (api.category.toLowerCase().includes('card')) type = 'idCard';
  else if (api.category.toLowerCase().includes('vehicle')) type = 'vehicle';

  return {
    id: api.id,
    name: api.assetName,
    type,
    assignedDate: '', // Not provided by API
    status,
    serialNumber: api.serialNumber,
    condition,
    notes: api.assignedTo ? `Assigned to: ${api.assignedTo}` : undefined,
  };
}

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // Get employee ID from sessionStorage on component mount
  useEffect(() => {
    const id = sessionStorage.getItem('employeeId') || localStorage.getItem('employeeId');
    if (!id) {
      setError('Employee ID not found. Please login again.');
      // Redirect to login after a short delay
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
      return;
    }
    setEmployeeId(id);
  }, [router]);

  // Fetch assets when employeeId is available
  useEffect(() => {
    if (!employeeId) return; // Don't fetch if employeeId is not available
    
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        const data = await response.json();
        const mapped = Array.isArray(data) ? data.map(mapApiAssetToAsset) : [];
        setAssets(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssets();
  }, [employeeId]); // Dependency on employeeId

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-6 h-6 text-blue-600" />;
      case 'phone':
        return <Smartphone className="w-6 h-6 text-green-600" />;
      case 'sim':
        return <Wifi className="w-6 h-6 text-purple-600" />;
      case 'idCard':
        return <CreditCard className="w-6 h-6 text-orange-600" />;
      case 'vehicle':
        return <Car className="w-6 h-6 text-red-600" />;
    }
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getConditionColor = (condition: Asset['condition']) => {
    switch (condition) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
         <div className="mb-6">
                  <Link
                    href="/employee"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                  </Link>
                </div>
        <div className="mb-8">
         
          <h1 className="text-2xl font-bold text-gray-900">My Assets</h1>
          <p className="mt-2 text-gray-600">View and manage your assigned company assets</p>
        </div>

        {/* Loading/Error State */}
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading assets...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">Error: {error}</div>
        ) : (
        <>
        {/* Asset Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {assets.filter(a => a.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Active Assets</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-yellow-600">
                  {assets.filter(a => a.status === 'maintenance').length}
                </p>
                <p className="text-sm text-gray-600">Under Maintenance</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-600">
                  {assets.filter(a => a.status === 'returned').length}
                </p>
                <p className="text-sm text-gray-600">Returned Assets</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Asset List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset List</h2>
          <div className="space-y-4">
            {assets.length === 0 ? (
              <div className="text-center text-gray-500">No assets assigned.</div>
            ) : (
              assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getAssetIcon(asset.type)}
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-gray-600">
                        Serial: {asset.serialNumber} {asset.assignedDate ? `| Assigned: ${new Date(asset.assignedDate).toLocaleDateString()}` : ''}
                      </p>
                      {asset.notes && (
                        <p className="text-sm text-yellow-600 mt-1">{asset.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.condition)}`}>
                      {asset.condition}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
} 