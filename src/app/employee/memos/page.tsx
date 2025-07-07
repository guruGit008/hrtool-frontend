'use client';
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  AlertCircle,
  Clock,
  ArrowLeft,
  Bell,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/constants/api';

interface Memo {
  id: string;
  title: string;
  meetingType: string;
  meetingDate?: string;
  priority: 'High' | 'Medium' | 'Low';
  content: string;
  sentBy: string;
  sentByName: string;
  recipientEmployeeIds: string[];
  recipientDepartments: string[];
  sentToAll: boolean;
  sentAt?: string;
  status?: 'sent' | 'draft';
}

const API_BASE_URL = APIURL +'/api';

export default function EmployeeMemosPage() {
  const router = useRouter();
  const [memos, setMemos] = useState<Memo[]>([]);
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

  // Fetch memos when employeeId is available
  useEffect(() => {
    if (!employeeId) return; // Don't fetch if employeeId is not available
    
    const fetchMemos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/memos/employee/${employeeId}`);
        setMemos(Array.isArray(response.data) ? response.data : []);
      } catch (err: unknown) {
        console.error('Failed to fetch memos:', err);
        setError('Failed to load memos. Please try again.');
        setMemos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemos();
  }, [employeeId]);

  const getPriorityColor = (priority: Memo['priority']) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'announcement':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'notice':
        return <Clock className="w-4 h-4" />;
      case 'team meeting':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 py-8">Loading memos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500 py-8">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/employee"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Memos</h1>
            <p className="mt-2 text-gray-600">View all memos and announcements sent to you</p>
          </div>

          {/* Memos List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Memos & Announcements</h2>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">{memos.length} memos</span>
              </div>
            </div>

            <div className="space-y-4">
              {memos.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No memos found</h3>
                  <p className="text-gray-500 mt-1">You don&apos;t have any memos or announcements yet.</p>
                </div>
              ) : (
                memos.map((memo) => {
                  // Safely parse and validate the creation date
                  const sentDate = memo.sentAt ? new Date(memo.sentAt) : null;
                  const isValidSentDate = sentDate && !isNaN(sentDate.getTime());

                  return (
                    <div key={memo.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getTypeIcon(memo.meetingType)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{memo.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Sent by {memo.sentByName} • {isValidSentDate ? sentDate.toLocaleString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(memo.priority)}`}>
                            {memo.priority} Priority
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                            {getTypeIcon(memo.meetingType)}
                            <span className="ml-1 capitalize">{memo.meetingType}</span>
                          </span>
                        </div>
                      </div>

                      {/* Meeting Date Section */}
                      {memo.meetingDate && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Meeting Date:</span>
                            <span className="text-sm text-blue-700">
                              {new Date(memo.meetingDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{memo.content}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>From: {memo.sentByName}</span>
                          {memo.sentToAll && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Sent to All</span>}
                        </div>
                        <span>{isValidSentDate ? sentDate.toLocaleDateString() : 'Unknown date'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 