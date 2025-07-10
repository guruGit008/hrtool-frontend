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
  subtype?: string;
  title: string;
  date: string | number[];
  status: 'draft' | 'submitted' | 'approved' | null;
  content?: string | null;
  attachments?: string[] | null;
  submittedBy?: string;
  approvedBy?: string;
  approvedDate?: string;
  department?: string;
  employeeId?: string;
  employeeName?: string;
  customerName?: string;
  designation?: string;
  landlineOrMobile?: string;
  emailId?: string;
  remarks?: string;
  productOrRequirements?: string;
  division?: string;
  company?: string;
  // OEM - orders
  poNumber?: string;
  orderDate?: string;
  item?: string;
  quantity?: string;
  partNumber?: string;
  xmwPrice?: string;
  unitTotalOrderValue?: string;
  totalPoValue?: string;
  xmwInvoiceRef?: string;
  xmwInvoiceDate?: string;
  // OEM - competitor_analysis
  slNo?: number;
  itemDescription?: string;
  competitor?: string;
  modelNumber?: string;
  unitPrice?: string;
  // OEM - holding_projects
  quotationNumber?: string;
  productDescription?: string;
  xmwValue?: string;
  holdingProjectsList?: {
    customerName?: string;
    quotationNumber?: string;
    productDescription?: string;
    quantity?: string;
    xmwValue?: string;
    remarks?: string;
  }[];
}
 
// Define your backend API base URL
const BASE_URL = APIURL + '/api/reports'; // Your Spring Boot backend URL
 
export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]); // No default report
  const [selectedType, setSelectedType] = useState<string>('employee');
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
 
  const oemSubtypes = [
    { id: 'orders', label: 'Orders' },
    { id: 'competitor_analysis', label: 'Competitor Analysis' },
    { id: 'open_tenders', label: 'Open Tenders' },
    { id: 'bugetary_submits', label: 'Bugetary Submits' },
    { id: 'lost_tenders', label: 'Lost Tenders' },
    { id: 'holding_projects', label: 'Holding Projects' },
  ];
 
  const getReportIcon = (type: string) => {
    const reportType = reportTypes.find(t => t.id === type);
    return reportType?.icon || <FileText className="w-5 h-5" />;
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
    // OEM
    if (newReport.type === 'oem') {
      let reportData: Partial<Report> = {
        type: 'oem',
        subtype: newReport.subtype,
        submittedBy: employeeId,
        attachments: newReport.attachments || [],
      };
      if (newReport.subtype === 'orders') {
        reportData = {
          ...reportData,
          poNumber: newReport.poNumber,
          orderDate: newReport.orderDate,
          item: newReport.item,
          quantity: newReport.quantity,
          partNumber: newReport.partNumber,
          xmwPrice: newReport.xmwPrice,
          unitTotalOrderValue: newReport.unitTotalOrderValue,
          totalPoValue: newReport.totalPoValue,
          customerName: newReport.customerName,
          xmwInvoiceRef: newReport.xmwInvoiceRef,
          xmwInvoiceDate: newReport.xmwInvoiceDate,
          status: newReport.status,
        };
      } else if (newReport.subtype === 'competitor_analysis') {
        reportData = {
          ...reportData,
          slNo: newReport.slNo,
          customerName: newReport.customerName,
          itemDescription: newReport.itemDescription,
          competitor: newReport.competitor,
          modelNumber: newReport.modelNumber,
          unitPrice: newReport.unitPrice,
        };
      } else {
        reportData = {
          ...reportData,
          customerName: newReport.customerName,
          quotationNumber: newReport.quotationNumber,
          productDescription: newReport.productDescription,
          quantity: newReport.quantity,
          xmwValue: newReport.xmwValue,
          remarks: newReport.remarks,
          attachments: newReport.attachments || [],
        };
      }
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
        setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
        setError(null);
        toast.success('OEM Report submitted successfully!');
      } catch (err: unknown) {
        setError(`Error submitting OEM report: ${err instanceof Error ? err.message : 'Unknown error'}`);
        toast.error('Failed to submit OEM report. Please try again later.');
      }
      return;
    }
    if (newReport.type === 'customer') {
      // Validate required fields for customer report
      if (!customerReport.title || !customerReport.date || !customerReport.customerName || !customerReport.designation || !customerReport.landlineOrMobile || !customerReport.emailId || !customerReport.productOrRequirements || !customerReport.division || !customerReport.company) {
        setError('Please fill all required fields for Customer Report.');
        return;
      }
      const dateArr = customerReport.date ? customerReport.date.split('-').map(Number) : null;
      const reportData = {
        type: 'customer',
        title: customerReport.title,
        date: dateArr,
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
    // OEM FORM
    if (newReport.type === 'oem') {
      return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl transform transition-all animate-slideIn">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FilePlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Create OEM Report</h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your OEM report</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNewReportForm(false);
                  setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                  setError(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Add scrollable wrapper for all OEM form fields */}
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* OEM Subtype Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">OEM Report Subtype</label>
                <div className="flex gap-2">
                  <select
                    value={oemSubtypes.some(s => s.id === (newReport.subtype || '')) ? newReport.subtype || '' : ''}
                    onChange={e => setNewReport({ ...newReport, subtype: e.target.value })}
                    className="w-1/2 rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors appearance-none bg-white pr-10 py-2.5"
                  >
                    <option value="">-- Select Subtype --</option>
                    {oemSubtypes.map(subtype => (
                      <option key={subtype.id} value={subtype.id}>{subtype.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={oemSubtypes.some(s => s.id === (newReport.subtype || '')) ? '' : (newReport.subtype || '')}
                    onChange={e => setNewReport({ ...newReport, subtype: e.target.value })}
                    placeholder="Or enter new subtype"
                    className="w-1/2 rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5"
                  />
                </div>
              </div>
              {/* Dynamic Fields by Subtype */}
              {newReport.subtype === 'orders' && (
                <div className="max-w-2xl mx-auto">
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "PO Number", key: "poNumber", type: "text" },
                        { label: "Order Date", key: "orderDate", type: "date" },
                        { label: "Item", key: "item", type: "text" },
                        { label: "Quantity", key: "quantity", type: "text" },
                        { label: "Part Number", key: "partNumber", type: "text" },
                        { label: "XMW Price", key: "xmwPrice", type: "text" },
                        { label: "Unit Total Order Value", key: "unitTotalOrderValue", type: "text" },
                        { label: "Total PO Value", key: "totalPoValue", type: "text" },
                        { label: "Customer Name", key: "customerName", type: "text" },
                        { label: "XMW Invoice Ref", key: "xmwInvoiceRef", type: "text" },
                        { label: "XMW Invoice Date", key: "xmwInvoiceDate", type: "date" },
                        { label: "Status", key: "status", type: "text" },
                      ].map(field => (
                        <div key={field.key} className="flex flex-col">
                          <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                          <input
                            type={field.type}
                            value={
                              typeof newReport[field.key as keyof typeof newReport] === 'string'
                                ? newReport[field.key as keyof typeof newReport] as string
                                : typeof newReport[field.key as keyof typeof newReport] === 'number'
                                  ? String(newReport[field.key as keyof typeof newReport])
                                  : ''
                            }
                            onChange={e => setNewReport({ ...newReport, [field.key]: e.target.value })}
                            className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {newReport.subtype === 'competitor_analysis' && (
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sl. No.</label>
                      <input type="number" value={newReport.slNo || ''} onChange={e => setNewReport({ ...newReport, slNo: Number(e.target.value) })} className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                      <input type="text" value={newReport.customerName || ''} onChange={e => setNewReport({ ...newReport, customerName: e.target.value })} className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Item Description</label>
                      <input type="text" value={newReport.itemDescription || ''} onChange={e => setNewReport({ ...newReport, itemDescription: e.target.value })} className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Competitor</label>
                      <input type="text" value={newReport.competitor || ''} onChange={e => setNewReport({ ...newReport, competitor: e.target.value })} className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model Number</label>
                      <input type="text" value={newReport.modelNumber || ''} onChange={e => setNewReport({ ...newReport, modelNumber: e.target.value })} className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                      <input type="text" value={newReport.unitPrice || ''} onChange={e => setNewReport({ ...newReport, unitPrice: e.target.value })} className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1" />
                    </div>
                  </div>
                </div>
              )}
              {/* For all OEM subtypes that use the same form as holding_projects */}
              {newReport.type === 'oem' && ['holding_projects', 'open_tenders', 'bugetary_submits', 'lost_tenders'].includes(newReport.subtype || '') && (
                <div className="max-w-2xl mx-auto max-h-[500px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                      <input
                        type="text"
                        value={newReport.customerName || ''}
                        onChange={e => setNewReport({ ...newReport, customerName: e.target.value })}
                        className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700">Quotation Number</label>
                      <input
                        type="text"
                        value={newReport.quotationNumber || ''}
                        onChange={e => setNewReport({ ...newReport, quotationNumber: e.target.value })}
                        className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700">Product Description</label>
                      <input
                        type="text"
                        value={newReport.productDescription || ''}
                        onChange={e => setNewReport({ ...newReport, productDescription: e.target.value })}
                        className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="text"
                        value={newReport.quantity || ''}
                        onChange={e => setNewReport({ ...newReport, quantity: e.target.value })}
                        className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700">XMW Value</label>
                      <input
                        type="text"
                        value={newReport.xmwValue || ''}
                        onChange={e => setNewReport({ ...newReport, xmwValue: e.target.value })}
                        className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700">Remarks</label>
                      <input
                        type="text"
                        value={newReport.remarks || ''}
                        onChange={e => setNewReport({ ...newReport, remarks: e.target.value })}
                        className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
              {newReport.subtype !== 'orders' && newReport.subtype !== 'competitor_analysis' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={newReport.title || ''}
                      onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                      className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1"
                      placeholder="Enter report title"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                      value={newReport.content || ''}
                      onChange={e => setNewReport({ ...newReport, content: e.target.value })}
                      rows={4}
                      className="w-full rounded-lg border-gray-200 shadow-sm py-2.5 mt-1"
                      placeholder="Enter report content"
                    />
                  </div>
                 
                </div>
              )}
              {/* Error Message */}
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowNewReportForm(false);
                    setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                    setError(null);
                  }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="px-6 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // CUSTOMER REPORT FORM
    if (newReport.type === 'customer') {
      const maxWords = 1000;
      const wordCount = customerReport.content?.trim().split(/\s+/).filter(word => word.length > 0).length || 0;
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
                  <h2 className="text-2xl font-semibold text-gray-900">Create Customer Report</h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your customer report</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNewReportForm(false);
                  setCustomerReport({
                    title: '', content: '', date: '', status: 'submitted', submittedBy: '', customerName: '', designation: '', landlineOrMobile: '', emailId: '', remarks: '', productOrRequirements: '', division: '', company: '', attachments: []
                  });
                  setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                  setError(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={customerReport.title}
                    onChange={e => setCustomerReport({ ...customerReport, title: e.target.value })}
                    placeholder="Enter report title"
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={customerReport.date}
                    onChange={e => setCustomerReport({ ...customerReport, date: e.target.value })}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    value={customerReport.customerName}
                    onChange={e => setCustomerReport({ ...customerReport, customerName: e.target.value })}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <input
                    type="text"
                    value={customerReport.designation}
                    onChange={e => setCustomerReport({ ...customerReport, designation: e.target.value })}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Landline/Mobile</label>
                  <input
                    type="text"
                    value={customerReport.landlineOrMobile}
                    onChange={e => setCustomerReport({ ...customerReport, landlineOrMobile: e.target.value })}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email ID</label>
                  <input
                    type="email"
                    value={customerReport.emailId}
                    onChange={e => setCustomerReport({ ...customerReport, emailId: e.target.value })}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Product/Requirements</label>
                  <input
                    type="text"
                    value={customerReport.productOrRequirements}
                    onChange={e => setCustomerReport({ ...customerReport, productOrRequirements: e.target.value })}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Department (Division)</label>
                  <select
                    value={customerReport.division}
                    onChange={e => setCustomerReport({ ...customerReport, division: e.target.value })}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 mb-2"
                  >
                    <option value="">Select Division</option>
                    {divisionOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={customerReport.division}
                    onChange={e => setCustomerReport({ ...customerReport, division: e.target.value })}
                    placeholder="Enter or select department/division"
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <select
                    value={customerReport.company}
                    onChange={e => setCustomerReport({ ...customerReport, company: e.target.value })}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 mb-2"
                  >
                    <option value="">Select Company</option>
                    {companyOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={customerReport.company}
                    onChange={e => setCustomerReport({ ...customerReport, company: e.target.value })}
                    placeholder="Enter or select company"
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <input
                  type="text"
                  value={customerReport.remarks}
                  onChange={e => setCustomerReport({ ...customerReport, remarks: e.target.value })}
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{wordCount} words</span>
                    <span className={`text-sm ${remainingWords < 100 ? 'text-red-500' : 'text-gray-500'}`}>({remainingWords} remaining)</span>
                  </div>
                </div>
                <textarea
                  value={customerReport.content}
                  onChange={e => {
                    const text = e.target.value;
                    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
                    if (words.length <= maxWords) {
                      setCustomerReport({ ...customerReport, content: text });
                    }
                  }}
                  rows={6}
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
                    setCustomerReport({
                      title: '', content: '', date: '', status: 'submitted', submittedBy: '', customerName: '', designation: '', landlineOrMobile: '', emailId: '', remarks: '', productOrRequirements: '', division: '', company: '', attachments: []
                    });
                    setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                    setError(null);
                  }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // On submit, just use the value in the text input for division and company
                    handleSubmitReport();
                  }}
                  className="px-6 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // ... existing code for default (employee) report form ...
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
                value={newReport.content ?? ''}
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
                    status: null
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
                {/* Remove 'All Reports' button */}
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
                              <div className="font-medium text-gray-800">{Array.isArray(report.date) ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(report.date[2]).padStart(2, '0')}` : report.date}</div>
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
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Content</div>
                            <div className="text-gray-700">{typeof report.content === 'string' && report.content.trim() ? report.content : '-'}</div>
                          </div>
                        
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
                                  <p>Date: {Array.isArray(report.date) ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(report.date[2]).padStart(2, '0')}` : report.date}</p>
                                  <p>Submitted by: {report.submittedBy}</p>
                                  {report.approvedBy && (
                                    <p>Approved by: {report.approvedBy} on {new Date(report.approvedDate!).toLocaleDateString()}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                             
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
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Content</div>
                            <div className="text-gray-700">{typeof report.content === 'string' && report.content.trim() ? report.content : '-'}</div>
                          </div>
                       
                        </div>
                      )
                    ))
                  )}
                </div>
              </div>
            )}
            {selectedType === 'employee' && (
              <div className="space-y-4">
                {reports.filter(report => report.type === 'employee' && (selectedSubtype === 'all' || report.subtype === selectedSubtype)).length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No employee reports found for the selected filters.</div>
                ) : (
                  reports.filter(report => report.type === 'employee' && (selectedSubtype === 'all' || report.subtype === selectedSubtype)).map(report => (
                    <div key={report.id} className="border rounded-2xl p-6 bg-gradient-to-br from-green-50 to-white shadow-md animate-fadeIn">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            {getReportIcon(report.type)}
                          </div>
                          <h3 className="font-semibold text-xl text-gray-900">{report.title}</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Subtype</div>
                          <div className="font-medium text-gray-800">{employeeSubtypes.find(s => s.id === report.subtype)?.label || report.subtype || '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Date</div>
                          <div className="font-medium text-gray-800">{Array.isArray(report.date) ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(report.date[2]).padStart(2, '0')}` : report.date}</div>
                        </div>
                      
                      
                      </div>
                     
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-1">Content</div>
                        <div className="text-gray-700">{typeof report.content === 'string' && report.content.trim() ? report.content : '-'}</div>
                      </div>
                      {/* Add more fields as needed */}
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
                  ))
                )}
              </div>
            )}
            {selectedType === 'oem' && selectedSubtype !== 'competitor_analysis' && (
  <div className="space-y-4">
    {reports.filter(report => report.type === 'oem').length === 0 ? (
      <div className="text-center text-gray-500 py-8">No OEM reports found for the selected filters.</div>
    ) : (
      reports.filter(report => report.type === 'oem').map(report => (
        <div key={report.id} className="border rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-white shadow-md animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                {getReportIcon(report.type)}
              </div>
              <h3 className="font-semibold text-xl text-gray-900">{report.subtype ? oemSubtypes.find(s => s.id === report.subtype)?.label : 'OEM Report'}</h3>
            </div>
          </div>
          {/* Subtype-specific fields */}
          {report.subtype === 'orders' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div><div className="text-xs text-gray-500 mb-1">PO Number</div><div className="font-medium text-gray-800">{report.poNumber || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Order Date</div><div className="font-medium text-gray-800">{report.orderDate || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Item</div><div className="font-medium text-gray-800">{report.item || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Quantity</div><div className="font-medium text-gray-800">{report.quantity || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Part Number</div><div className="font-medium text-gray-800">{report.partNumber || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">XMW Price</div><div className="font-medium text-gray-800">{report.xmwPrice || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Unit Total Order Value</div><div className="font-medium text-gray-800">{report.unitTotalOrderValue || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Total PO Value</div><div className="font-medium text-gray-800">{report.totalPoValue || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Customer Name</div><div className="font-medium text-gray-800">{report.customerName || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">XMW Invoice Ref</div><div className="font-medium text-gray-800">{report.xmwInvoiceRef || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">XMW Invoice Date</div><div className="font-medium text-gray-800">{report.xmwInvoiceDate || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Status</div><div className="font-medium text-gray-800">{report.status || '-'}</div></div>
            </div>
          )}
          {report.subtype === 'competitor_analysis' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div><div className="text-xs text-gray-500 mb-1">Sl. No.</div><div className="font-medium text-gray-800">{report.slNo || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Customer Name</div><div className="font-medium text-gray-800">{report.customerName || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Item Description</div><div className="font-medium text-gray-800">{report.itemDescription || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Competitor</div><div className="font-medium text-gray-800">{report.competitor || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Model Number</div><div className="font-medium text-gray-800">{report.modelNumber || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Unit Price</div><div className="font-medium text-gray-800">{report.unitPrice || '-'}</div></div>
            </div>
          )}
          {report.subtype !== 'orders' && report.subtype !== 'competitor_analysis' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div><div className="text-xs text-gray-500 mb-1">Customer Name</div><div className="font-medium text-gray-800">{report.customerName || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Quotation Number</div><div className="font-medium text-gray-800">{report.quotationNumber || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Product Description</div><div className="font-medium text-gray-800">{report.productDescription || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Quantity</div><div className="font-medium text-gray-800">{report.quantity || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">XMW Value</div><div className="font-medium text-gray-800">{report.xmwValue || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Remarks</div><div className="font-medium text-gray-800">{report.remarks || '-'}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Attachments</div><div className="font-medium text-gray-800">{report.attachments?.join(', ') || '-'}</div></div>
            </div>
          )}
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
      ))
    )}
  </div>
)}
            {selectedType === 'oem' && selectedSubtype === 'competitor_analysis' && (
  <div className="overflow-x-auto rounded-2xl shadow border border-gray-200 bg-white mt-6">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sl. No.</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Name</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Item Description</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Competitor</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Model Number</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit Price</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Submitted By</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employee Name</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Attachments</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {reports.filter(r => r.type === 'oem' && r.subtype === 'competitor_analysis').length === 0 ? (
          <tr>
            <td colSpan={10} className="px-6 py-4 text-center text-gray-400">No competitor analysis reports found.</td>
          </tr>
        ) : (
          reports.filter(r => r.type === 'oem' && r.subtype === 'competitor_analysis').map((report) => (
            <tr key={report.id} className="hover:bg-blue-50 transition">
              <td className="px-6 py-4">{report.slNo ?? '-'}</td>
              <td className="px-6 py-4">{report.customerName || '-'}</td>
              <td className="px-6 py-4">{report.itemDescription || '-'}</td>
              <td className="px-6 py-4">{report.competitor || '-'}</td>
              <td className="px-6 py-4">{report.modelNumber || '-'}</td>
              <td className="px-6 py-4">{report.unitPrice || '-'}</td>
              <td className="px-6 py-4">{Array.isArray(report.date) ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(report.date[2]).padStart(2, '0')}` : report.date || '-'}</td>
              <td className="px-6 py-4">{report.submittedBy || '-'}</td>
              <td className="px-6 py-4">{report.employeeName || '-'}</td>
              <td className="px-6 py-4">
                {report.attachments && report.attachments.length > 0 ? (
                  <ul className="list-disc ml-4">
                    {report.attachments.map((att, idx) => (
                      <li key={idx}><a href={att} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{att}</a></li>
                    ))}
                  </ul>
                ) : '-'}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}
          </div>
        </div>
      </div>
      {renderNewReportForm()}
    </>
  );
}
 

