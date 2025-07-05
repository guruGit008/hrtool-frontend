'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  FilePlus,
  Building,
  Users,
  Map,
  Target,
  Award,
  Calendar,
  Download,
  ArrowLeft,
  Trash2 // Added for delete functionality (optional, but good to have)
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';
 
interface Report {
  id: number;
  type: 'employee' | 'visit' | 'oem' | 'customer' | 'blueprint' | 'projection' | 'achievement';
  subtype?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  title: string;
  date: string;
  status: 'draft' | 'submitted' | 'approved';
  content: string;
  attachments?: string[];
  submittedBy?: string;
  approvedBy?: string;
  approvedDate?: string;
}
 
// Define your backend API base URL
const BASE_URL = APIURL + '/api/reports'; // Your Spring Boot backend URL
 
export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('all');
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [newReport, setNewReport] = useState<Partial<Report>>({
    type: 'employee',
    subtype: 'daily',
    title: '',
    content: '',
    status: 'draft' // Default status for new reports
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
 
  const reportTypes = [
    { id: 'employee', label: 'Employee Report', icon: <FileText className="w-5 h-5" /> },
    { id: 'visit', label: 'Visit Report', icon: <Map className="w-5 h-5" /> },
    { id: 'oem', label: 'OEM Report', icon: <Building className="w-5 h-5" /> },
    { id: 'customer', label: 'Customer Report', icon: <Users className="w-5 h-5" /> },
    { id: 'blueprint', label: 'Blueprint Report', icon: <FileText className="w-5 h-5" /> },
    { id: 'projection', label: 'Projection Report', icon: <Target className="w-5 h-5" /> },
    { id: 'achievement', label: 'Achievement Report', icon: <Award className="w-5 h-5" /> }
  ];
 
  const employeeSubtypes = [
    { id: 'daily', label: 'Daily Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'weekly', label: 'Weekly Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'monthly', label: 'Monthly Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'yearly', label: 'Yearly Report', icon: <Calendar className="w-5 h-5" /> }
  ];
 
  const getReportIcon = (type: string) => {
    const reportType = reportTypes.find(t => t.id === type);
    return reportType?.icon || <FileText className="w-5 h-5" />;
  };
 
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
 
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
 
  // Function to fetch reports from the backend - now employee-specific
  const fetchReports = useCallback(async () => {
    if (!employeeId) return; // Don't fetch if employeeId is not available
    
    setLoading(true);
    setError(null);
    
    try {
      // First, try to fetch all reports for the employee
      const url = `${BASE_URL}/employee/${employeeId}`;
      
      console.log('Fetching reports with URL:', url);
      console.log('Selected type:', selectedType);
      console.log('Selected subtype:', selectedSubtype);
 
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allReports: Report[] = await response.json();
      console.log('Received all reports:', allReports);
 
      // Apply client-side filtering
      let filteredReports = allReports;
      
      // Filter by type
      if (selectedType !== 'all') {
        filteredReports = filteredReports.filter(report => report.type === selectedType);
      }
      
      // Filter by subtype (only for employee reports)
      if (selectedType === 'employee' && selectedSubtype !== 'all') {
        filteredReports = filteredReports.filter(report => report.subtype === selectedSubtype);
      }
      
      console.log('Filtered reports:', filteredReports);
      setReports(filteredReports);
      
    } catch (err: unknown) {
      setError(`Failed to fetch reports: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedSubtype, employeeId]); // Added employeeId as dependency
 
  // useEffect to call fetchReports when component mounts or filters change
  useEffect(() => {
    if (employeeId) {
      fetchReports();
    }
  }, [fetchReports, employeeId]); // Added employeeId as dependency
 
  const handleSubmitReport = async () => {
    if (!employeeId) {
      setError('Employee ID not found. Please login again.');
      return;
    }
    
    // Ensure required fields are present
    if (!newReport.title || !newReport.content) {
      setError('Title and Content are required.');
      return;
    }
 
    // Set default values for new report that backend might expect if not explicitly sent
    const reportData = {
      ...newReport,
      date: new Date().toISOString().split('T')[0], // Backend expects YYYY-MM-DD
      status: newReport.status || 'submitted', // Or 'draft' based on your default creation logic
      submittedBy: employeeId // Use the actual employee ID
    };
 
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create report: ${response.status}`);
      }
 
      const createdReport: Report = await response.json();
      setReports([createdReport, ...reports]); // Add new report to the top of the list
      setShowNewReportForm(false);
      setNewReport({ // Reset form
        type: 'employee',
        subtype: 'daily',
        title: '',
        content: '',
        status: 'draft'
      });
      setError(null); // Clear any previous errors
      toast.success('Report submitted successfully!');
    } catch (err: unknown) {
      setError(`Error submitting report: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("Error submitting report:", err);
      toast.error('Failed to submit report. Please try again later.');
    }
  };
 
  const handleDeleteReport = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }
 
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });
 
      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.status}`);
      }
 
      setReports(reports.filter(report => report.id !== id));
      setError(null);
      toast.success('Report deleted successfully!');
    } catch (err: unknown) {
      setError(`Error deleting report: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("Error deleting report:", err);
      toast.error('Failed to delete report. Please try again later.');
    }
  };
 
 
  const renderNewReportForm = () => {
    if (!showNewReportForm) return null;
 
    const maxWords = 1000;
    const wordCount = newReport.content?.trim().split(/\s+/).filter(word => word.length > 0).length || 0;
    const remainingWords = maxWords - wordCount;
 
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl transform transition-all animate-slideIn">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FilePlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Create New Report</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your report</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowNewReportForm(false);
                setNewReport({
                  type: 'employee',
                  subtype: 'daily',
                  title: '',
                  content: '',
                  status: 'draft'
                });
                setError(null); // Clear error on close
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
 
  <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Report Type</label>
                <div className="relative">
                  <select
                    value={newReport.type}
                    onChange={(e) => {
                      const type = e.target.value as Report['type'];
                      setNewReport({
                        ...newReport,
                        type,
                        subtype: type === 'employee' ? newReport.subtype : undefined
                      });
                    }}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors appearance-none bg-white pr-10 py-2.5"
                  >
                    {reportTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
 
 
 {newReport.type === 'employee' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Report Subtype</label>
                  <div className="relative">
                    <select
                      value={newReport.subtype || 'daily'}
                      onChange={(e) => setNewReport({ ...newReport, subtype: e.target.value as Report['subtype'] })}
                      className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors appearance-none bg-white pr-10 py-2.5"
                    >
                      {employeeSubtypes.map(subtype => (
                        <option key={subtype.id} value={subtype.id}>{subtype.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
 
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                placeholder="Enter a descriptive title for your report"
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
              />
            </div>
 
            {/* Content Textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {wordCount} words
                  </span>
                  <span className={`text-sm ${remainingWords < 100 ? 'text-red-500' : 'text-gray-500'}`}>
                    ({remainingWords} remaining)
                  </span>
                </div>
              </div>
              <textarea
                value={newReport.content}
                onChange={(e) => {
                  const text = e.target.value;
                  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
                  if (words.length <= maxWords) {
                    setNewReport({ ...newReport, content: text });
                  }
                }}
                rows={8}
                placeholder="Write your report content here (max 1000 words)"
                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none py-2.5"
              />
            </div>
 
            {/* Error Message */}
            {error && <div className="text-red-600 text-sm">{error}</div>}
 
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                onClick={() => {
                  setShowNewReportForm(false);
                  setNewReport({
                    type: 'employee',
                    subtype: 'daily',
                    title: '',
                    content: '',
                    status: 'draft'
                  });
                  setError(null); // Clear error on cancel
                }}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!newReport.title || !newReport.content || wordCount === 0}
                className="px-6 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  const styles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `;
 
  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Toaster position="top-right" />
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
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <button
                onClick={() => setShowNewReportForm(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FilePlus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90 duration-200" />
                <span>New Report</span>
              </button>
            </div>
 
            {/* Report Type Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    console.log('Setting filter to: all');
                    setSelectedType('all');
                    setSelectedSubtype('all');
                  }}
                  className={`px-3 py-1 rounded-lg ${
                    selectedType === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Reports
                </button>
                {reportTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      console.log('Setting filter to:', type.id);
                      setSelectedType(type.id);
                      setSelectedSubtype('all');
                    }}
                    className={`px-3 py-1 rounded-lg flex items-center space-x-2 ${
                      selectedType === type.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.icon}
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
 
            {/* Employee Report Subtype Filter */}
            {selectedType === 'employee' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      console.log('Setting subtype to: all');
                      setSelectedSubtype('all');
                    }}
                    className={`px-3 py-1 rounded-lg ${
                      selectedSubtype === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Employee Reports
                  </button>
                  {employeeSubtypes.map(subtype => (
                    <button
                      key={subtype.id}
                      onClick={() => {
                        console.log('Setting subtype to:', subtype.id);
                        setSelectedSubtype(subtype.id);
                      }}
                      className={`px-3 py-1 rounded-lg flex items-center space-x-2 ${
                        selectedSubtype === subtype.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {subtype.icon}
                      <span>{subtype.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
 
            {/* Loading and Error Indicators */}
            {loading && <div className="text-center py-4 text-gray-500">Loading reports...</div>}
            {error && <div className="text-center py-4 text-red-600">{error}</div>}
 
            {/* Reports List */}
            {!loading && !error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No reports found for the selected filters.</div>
                  ) : (
                    reports.map(report => (
                      <div key={report.id} className="border rounded-lg p-4 animate-fadeIn">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getReportIcon(report.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{report.title}</h3>
                              <div className="mt-1 text-sm text-gray-600">
                                <p>Type: {reportTypes.find(t => t.id === report.type)?.label}</p>
                                {report.type === 'employee' && report.subtype && (
                                  <p>Subtype: {employeeSubtypes.find(s => s.id === report.subtype)?.label}</p>
                                )}
                                <p>Date: {new Date(report.date).toLocaleDateString()}</p>
                                <p>Submitted by: {report.submittedBy}</p>
                                {report.approvedBy && (
                                  <p>Approved by: {report.approvedBy} on {new Date(report.approvedDate!).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                            {/* Optional: Add Download button if attachments are actual URLs */}
                            {report.attachments && report.attachments.length > 0 && (
                                <a
                                  href={`/api/download-attachment/${report.id}`} // Example: Replace with actual download endpoint
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                  title="Download Attachments"
                                >
                                  <Download className="w-5 h-5" />
                                </a>
                            )}
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              title="Delete Report"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                          <p>{report.content}</p>
                        </div>
                        {report.attachments && report.attachments.length > 0 && (
                          <div className="mt-4 flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Attachments: {report.attachments.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {renderNewReportForm()}
    </>
  );
}
 
 