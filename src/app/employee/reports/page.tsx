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
  department?: string;
  customerName?: string;
  designation?: string;
  landlineOrMobile?: string;
  emailId?: string;
  remarks?: string;
  productOrRequirements?: string;
  division?: string;
  company?: string; // Added company field
}
 
// Define your backend API base URL
const BASE_URL = APIURL + '/api/reports'; // Your Spring Boot backend URL
 
export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([
    {
      id: 99999,
      type: 'customer',
      title: 'Customer Product Inquiry',
      submittedBy: 'EMP001',
      customerName: 'Jin',
      designation: 'great',
      landlineOrMobile: '+1234567890',
      emailId: 'jin@example.com',
      remarks: 'Follow up required within 2 days',
      productOrRequirements: 'Software Development Services',
      division: 'Sales',
      company: 'Acme Corp',
      date: '2025-07-05',
      status: 'submitted',
      content: '',
      attachments: [],
    },
  ]);
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
  const [customerReport, setCustomerReport] = useState({
    title: '',
    content: '',
    date: '',
    status: 'submitted',
    submittedBy: '',
    customerName: '',
    designation: '',
    landlineOrMobile: '',
    emailId: '',
    remarks: '',
    productOrRequirements: '',
    division: '',
    company: '',
    attachments: [] as string[],
  });
  const [divisionOptions, setDivisionOptions] = useState<string[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [searchOption, setSearchOption] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
 
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
 
  useEffect(() => {
    // Fetch division options from API
    fetch(APIURL + '/api/reports/customer-divisions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDivisionOptions(data);
        else if (data && Array.isArray(data.divisions)) setDivisionOptions(data.divisions);
      });
    // Fetch company options from API
    fetch(APIURL + '/api/reports/customer-companies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCompanyOptions(data);
        else if (data && Array.isArray(data.companies)) setCompanyOptions(data.companies);
      });
  }, []);
 
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
    if (newReport.type === 'customer') {
      // Validate required fields for customer report
      if (!customerReport.title || !customerReport.date || !customerReport.customerName || !customerReport.designation || !customerReport.landlineOrMobile || !customerReport.emailId || !customerReport.productOrRequirements || !customerReport.division || !customerReport.company) {
        setError('Please fill all required fields for Customer Report.');
        return;
      }
      const reportData = {
        type: 'customer',
        title: customerReport.title,
        date: customerReport.date,
        status: customerReport.status,
        submittedBy: employeeId,
        customerName: customerReport.customerName,
        designation: customerReport.designation,
        landlineOrMobile: customerReport.landlineOrMobile,
        emailId: customerReport.emailId,
        remarks: customerReport.remarks,
        productOrRequirements: customerReport.productOrRequirements,
        division: customerReport.division,
        company: customerReport.company,
        attachments: customerReport.attachments,
      };
      try {
        const response = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to create report: ${response.status}`);
        }
        const createdReport: Report = await response.json();
        setReports([createdReport, ...reports]);
        setShowNewReportForm(false);
        setCustomerReport({
          title: '', content: '', date: '', status: 'submitted', submittedBy: '', customerName: '', designation: '', landlineOrMobile: '', emailId: '', remarks: '', productOrRequirements: '', division: '', company: '', attachments: []
        });
        setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
        setError(null);
        toast.success('Customer Report submitted successfully!');
      } catch (err: unknown) {
        setError(`Error submitting customer report: ${err instanceof Error ? err.message : 'Unknown error'}`);
        toast.error('Failed to submit customer report. Please try again later.');
      }
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
    if (newReport.type === 'customer') {
      return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-8 p-0 animate-slideIn">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FilePlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Create Customer Report</h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your customer report</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNewReportForm(false);
                  setCustomerReport({ title: '', content: '', date: '', status: 'submitted', submittedBy: '', customerName: '', designation: '', landlineOrMobile: '', emailId: '', remarks: '', productOrRequirements: '', division: '', company: '', attachments: [] });
                  setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                  setError(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Body */}
            <form className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              {/* Customer Info Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={customerReport.title || ""}
                      onChange={e => setCustomerReport({ ...customerReport, title: e.target.value })}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 mt-1"
                      placeholder="Enter report title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={customerReport.date || ""}
                      onChange={e => setCustomerReport({ ...customerReport, date: e.target.value })}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={customerReport.customerName || ""}
                      onChange={e => setCustomerReport({ ...customerReport, customerName: e.target.value })}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 mt-1"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Designation <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={customerReport.designation || ""}
                      onChange={e => setCustomerReport({ ...customerReport, designation: e.target.value })}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 mt-1"
                      placeholder="Enter designation"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Landline or Mobile <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={customerReport.landlineOrMobile || ""}
                      onChange={e => setCustomerReport({ ...customerReport, landlineOrMobile: e.target.value })}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 mt-1"
                      placeholder="Enter landline or mobile number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email ID <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={customerReport.emailId || ""}
                      onChange={e => setCustomerReport({ ...customerReport, emailId: e.target.value })}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 mt-1"
                      placeholder="Enter email ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={customerReport.company || ""}
                      onChange={e => setCustomerReport({ ...customerReport, company: e.target.value })}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 mt-1"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerReport.division || ""}
                        onChange={e => setCustomerReport({ ...customerReport, division: e.target.value })}
                        onFocus={() => setShowDeptDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDeptDropdown(false), 100)}
                        placeholder="Select or search department"
                        className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 mt-1"
                        required
                        autoComplete="off"
                      />
                      {showDeptDropdown && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                          {divisionOptions.filter(opt =>
                            opt.toLowerCase().includes(customerReport.division.toLowerCase())
                          ).map(opt => (
                            <li
                              key={opt}
                              onMouseDown={() => {
                                setCustomerReport({ ...customerReport, division: opt });
                                setShowDeptDropdown(false);
                              }}
                              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${customerReport.division === opt ? 'bg-blue-100' : ''}`}
                            >
                              {opt}
                            </li>
                          ))}
                          {divisionOptions.filter(opt =>
                            opt.toLowerCase().includes(customerReport.division.toLowerCase())
                          ).length === 0 && (
                            <li className="px-4 py-2 text-gray-400">No results found</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Requirements Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Requirements & Remarks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product or Requirements <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={customerReport.productOrRequirements || ""}
                      onChange={e => setCustomerReport({ ...customerReport, productOrRequirements: e.target.value })}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 mt-1"
                      placeholder="Enter product or requirements discussed"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                      value={customerReport.remarks || ""}
                      onChange={e => setCustomerReport({ ...customerReport, remarks: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none py-2.5 mt-1"
                      placeholder="Any remarks"
                    />
                  </div>
                </div>
              </div>
              {/* Content Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Content</h3>
                <textarea
                  value={customerReport.content || ""}
                  onChange={e => setCustomerReport({ ...customerReport, content: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none py-2.5"
                  placeholder="Additional content (optional)"
                />
              </div>
              {/* Error Message */}
              {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row justify-end gap-4 pt-4 border-t mt-8">
                <button type="button" onClick={() => {
                  setShowNewReportForm(false);
                  setCustomerReport({ title: '', content: '', date: '', status: 'submitted', submittedBy: '', customerName: '', designation: '', landlineOrMobile: '', emailId: '', remarks: '', productOrRequirements: '', division: '', company: '', attachments: [] });
                  setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                  setError(null);
                }} className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 w-full md:w-auto">Cancel</button>
                <button type="button" onClick={handleSubmitReport} className="px-6 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" disabled={!customerReport.title || !customerReport.date || !customerReport.customerName || !customerReport.designation || !customerReport.landlineOrMobile || !customerReport.emailId || !customerReport.productOrRequirements || !customerReport.division || !customerReport.company}>Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      );
    }
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
 
            {/* Modern unified search bar for customer reports */}
            {selectedType === 'customer' && (
              <div className="mb-6 max-w-xs">
                <div className="relative group">
                  <input
                    type="text"
                    id="modern-search"
                    value={searchOption}
                    onChange={e => setSearchOption(e.target.value)}
                    onFocus={() => setShowSearchDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSearchDropdown(false), 100)}
                    placeholder=" "
                    className="block w-full px-12 py-3 text-base bg-white border border-gray-200 rounded-2xl shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150 peer"
                    autoComplete="off"
                  />
                  <label htmlFor="modern-search" className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none transition-all duration-150 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 bg-white px-1">
                    Search Department or Company
                  </label>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  </span>
                  {searchOption && (
                    <button
                      type="button"
                      onClick={() => setSearchOption("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-white rounded-full p-1 shadow-sm"
                      tabIndex={-1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  {showSearchDropdown && (
                    <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-2xl mt-2 shadow-xl animate-fadeIn overflow-hidden">
                      {divisionOptions.filter(opt =>
                        opt.toLowerCase().includes(searchOption.toLowerCase())
                      ).map(opt => (
                        <li
                          key={"division-" + opt}
                          onMouseDown={() => {
                            setSearchOption(opt);
                            setShowSearchDropdown(false);
                          }}
                          className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 flex items-center gap-2"
                        >
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                          <span className="text-xs text-blue-600 font-semibold">Department</span>
                          <span className="ml-2 text-gray-800">{opt}</span>
                        </li>
                      ))}
                      {companyOptions.filter(opt =>
                        opt.toLowerCase().includes(searchOption.toLowerCase())
                      ).map(opt => (
                        <li
                          key={"company-" + opt}
                          onMouseDown={() => {
                            setSearchOption(opt);
                            setShowSearchDropdown(false);
                          }}
                          className="px-4 py-3 cursor-pointer hover:bg-green-50 border-b last:border-b-0 flex items-center gap-2"
                        >
                          <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                          <span className="text-xs text-green-600 font-semibold">Company</span>
                          <span className="ml-2 text-gray-800">{opt}</span>
                        </li>
                      ))}
                      {divisionOptions.filter(opt =>
                        opt.toLowerCase().includes(searchOption.toLowerCase())
                      ).length === 0 && companyOptions.filter(opt =>
                        opt.toLowerCase().includes(searchOption.toLowerCase())
                      ).length === 0 && (
                        <li className="px-4 py-3 text-gray-400">No results found</li>
                      )}
                    </ul>
                  )}
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
                    reports.filter(report => report.type === 'customer' && (!searchOption || report.division === searchOption || report.company === searchOption)).map(report => (
                      report.type === 'customer' ? (
                        <div key={report.id} className="border rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-white shadow-md animate-fadeIn">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                {getReportIcon(report.type)}
                              </div>
                              <h3 className="font-semibold text-xl text-gray-900">{report.title}</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>{report.status}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Customer Name</div>
                              <div className="font-medium text-gray-800">{report.customerName || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Company</div>
                              <div className="font-medium text-gray-800">{report.company || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Designation</div>
                              <div className="font-medium text-gray-800">{report.designation || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Landline/Mobile</div>
                              <div className="font-medium text-gray-800">{report.landlineOrMobile || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Email ID</div>
                              <div className="font-medium text-gray-800">{report.emailId || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Product/Requirements</div>
                              <div className="font-medium text-gray-800">{report.productOrRequirements || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Date</div>
                              <div className="font-medium text-gray-800">{new Date(report.date).toLocaleDateString()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Department</div>
                              <div className="font-medium text-gray-800">{report.division || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Submitted By</div>
                              <div className="font-medium text-gray-800">{report.submittedBy || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Type</div>
                              <div className="font-medium text-gray-800">{reportTypes.find(t => t.id === report.type)?.label}</div>
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Remarks</div>
                            <div className="text-gray-700">{report.remarks || '-'}</div>
                          </div>
                          {/* <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Content</div>
                            <div className="text-gray-700">{report.content || '-'}</div>
                          </div>
                          {report.attachments && report.attachments.length > 0 && (
                            <div className="mt-4 flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Attachments: {report.attachments.join(', ')}</span>
                            </div>
                          )} */}
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                              title="Delete Report"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
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
                          {/* <div className="mt-4 text-sm text-gray-600">
                            <p>{report.content}</p>
                          </div>
                          {report.attachments && report.attachments.length > 0 && (
                            <div className="mt-4 flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Attachments: {report.attachments.join(', ')}
                              </span>
                            </div>
                          )} */}
                        </div>
                      )
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
 

