'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';
 
interface Leave {
  id?: number;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays?: number;
  status: string;
  reason: string;
  hrComments?: string;
  requestDate?: string;
}
 
interface Holiday {
  id: number;
  holidayName: string;
  day: string;
  startDate: [number, number, number];
  endDate: [number, number, number];
  type: string;
  coverage: string;
}
 
export default function LeavesPage() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newLeave, setNewLeave] = useState<Partial<Leave>>({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
 
  const API_BASE = APIURL + '/api/leave-requests';
  const HOLIDAYS_API = APIURL + '/api/holidays';
 
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
 
  // Fetch leave history when employeeId is available
  useEffect(() => {
    if (!employeeId) return; // Don't fetch if employeeId is not available
    
    setLoading(true);
    setError(null);
    axios.get(`${API_BASE}/employee/${employeeId}`)
      .then(res => {
        // Map API data to correct interface
        setLeaves(res.data.map((item: Leave) => ({
          id: item.id,
          employeeId: item.employeeId,
          employeeName: item.employeeName || '',
          leaveType: item.leaveType,
          startDate: item.startDate,
          endDate: item.endDate,
          numberOfDays: item.numberOfDays,
          status: item.status ? item.status.toLowerCase() : 'pending',
          reason: item.reason,
          hrComments: item.hrComments,
          requestDate: item.requestDate,
        })));
      })
      .catch(err => {
        console.error('Failed to fetch leaves:', err);
        setError('Failed to load leave history. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [API_BASE, employeeId]); // Added employeeId as dependency
 
  // Fetch holidays on mount
  useEffect(() => {
    axios.get(HOLIDAYS_API)
      .then(res => setHolidays(res.data))
      .catch(() => setHolidays([]));
  }, [HOLIDAYS_API]);
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
 
    if (!employeeId) {
      setError('Employee ID not found. Please login again.');
      return;
    }
 
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      setError("Please fill in all required fields (Start Date, End Date, Reason).");
      return;
    }
 
    if (new Date(newLeave.startDate) > new Date(newLeave.endDate)) {
      setError("Start Date cannot be after End Date.");
      return;
    }
 
    const leavePayload: Omit<Leave, 'id' | 'numberOfDays' | 'hrComments' | 'requestDate'> & { status: string } = {
      employeeId: employeeId,
      employeeName: newLeave.employeeName || '',
      leaveType: newLeave.leaveType || '',
      startDate: newLeave.startDate || '',
      endDate: newLeave.endDate || '',
      status: 'pending',
      reason: newLeave.reason || '',
    };
 
    axios.post<Leave>(`${API_BASE}/employee`, leavePayload)
      .then(res => {
        setLeaves([res.data, ...leaves]);
        setShowForm(false);
        setNewLeave({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
        toast.success('Leave request submitted successfully!');
      })
      .catch(err => {
        console.error("Failed to submit leave request:", err);
        setError("Failed to submit leave request. Please check your input and try again.");
        toast.error('Failed to submit leave request. Please check your input and try again.');
      });
  };
 
  const getStatusColor = (status: Leave['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
 
  const getStatusIcon = (status: Leave['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };
 
  const formatDateForDisplay = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };
 
  // Helper to format date array
  const formatDateArray = (arr?: [number, number, number]) => {
    if (!arr) return '';
    const [y, m, d] = arr;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };
 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <div className="mb-6">
        <Link href="/employee" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
 
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="mt-2 text-gray-600">Request and track your leaves</p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {['approved', 'pending', 'rejected'].map(status => (
            <div key={status} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-3xl font-bold ${
                    status === 'approved' ? 'text-green-600' :
                    status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {leaves.filter(l => l.status === status).length}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{status} Leaves</p>
                </div>
                <div className={`p-3 rounded-full ${
                  status === 'approved' ? 'bg-green-100' :
                  status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {getStatusIcon(status as Leave['status'])}
                </div>
              </div>
            </div>
          ))}
        </div>
 
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Request Leave</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-1" />
              New Request
            </button>
          </div>
 
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline ml-2">{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Leave Type</label>
                  <select
                    value={newLeave.leaveType}
                    onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                    className="w-full mt-1 border rounded-md p-2"
                    required
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
 
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <input
                    type="text"
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    className="w-full mt-1 border rounded-md p-2"
                    required
                    placeholder="e.g., Personal appointment"
                  />
                </div>
 
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full mt-1 border rounded-md p-2"
                    required
                  />
                </div>
 
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full mt-1 border rounded-md p-2"
                    required
                  />
                </div>
              </div>
 
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setNewLeave({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
                }} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
 
        {/* Holidays Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Company Holidays</h2>
          <div className="bg-white rounded-xl shadow-md p-4">
            {holidays.length === 0 ? (
              <div className="text-gray-500">No holidays found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-1">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Holiday Name</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Day</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map((h, idx) => (
                      <tr key={h.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-2 text-center font-medium text-gray-900">{h.holidayName}</td>
                        <td className="px-6 py-2 text-center text-gray-700">{formatDateArray(h.startDate)}</td>
                        <td className="px-6 py-2 text-center text-gray-700">{h.day}</td>
                        <td className="px-6 py-2 text-center text-gray-700">{h.type}</td>
                        <td className="px-6 py-2 text-center text-gray-700">{h.coverage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
 
        {/* Leave History */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Leave History</h2>
          {loading && <div className="text-center text-gray-500 py-8">Loading leave history...</div>}
          {!loading && error && <div className="text-center text-red-600 py-8">Error: {error}</div>}
          {!loading && !error && leaves.length === 0 && (
            <div className="text-center text-gray-500 py-8">No leave requests found.</div>
          )}
          {!loading && !error && leaves.length > 0 && (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave.id} className="flex justify-between border p-4 rounded-lg">
                  <div className="flex gap-4 items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium capitalize">{leave.leaveType} Leave</p>
                      <p className="text-sm text-gray-600">
                        {formatDateForDisplay(leave.startDate)} - {formatDateForDisplay(leave.endDate)}
                      </p>
                      <p className="text-sm text-gray-600">Reason: {leave.reason}</p>
                      {leave.hrComments && (
                        <p className="text-sm text-red-600">HR Comments: {leave.hrComments}</p>
                      )}
                      <p className="text-sm text-gray-500">Requested on: {formatDateForDisplay(leave.requestDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                    {getStatusIcon(leave.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
 