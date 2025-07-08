'use client';
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  
  Building,
  Users,
  Map,
  Target,
  Award,
  Calendar,
  Download,
  
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { APIURL } from '@/constants/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  employeeId?: string;
  employeeName?: string;
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

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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
    { id: 'achievement', label: 'Achievement Report', icon: <Award className="w-5 h-5" /> },
    { id: 'Visit Inquiries', label: 'Visit Inquiries', icon: <Award className="w-5 h-5" /> },
    { id: 'BQ quatitions', label: 'BQ quatitions', icon: <Award className="w-5 h-5" /> }
  ];

  const employeeSubtypes = [
    { id: 'daily', label: 'Daily Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'weekly', label: 'Weekly Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'monthly', label: 'Monthly Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'Quaterly', label: 'Quaterly Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'half', label: 'half Report', icon: <Calendar className="w-5 h-5" /> },
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

  const departments = [
    'IT',
    'Sales',
    'Marketing',
    'HR',
    'Finance',
    'Operations'
  ];

  const statuses = [
    { id: 'all', label: 'All Status' },
    { id: 'draft', label: 'Draft' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'approved', label: 'Approved' }
  ];

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(APIURL +'/api/reports');
        const mappedReports: Report[] = response.data.map((r: Report) => ({
          id: r.id,
          type: r.type,
          subtype: r.subtype,
          title: r.title,
          date: r.date,
          status: r.status,
          content: r.content,
          attachments: r.attachments ?? [],
          submittedBy: r.submittedBy,
          approvedBy: r.approvedBy,
          approvedDate: r.approvedDate,
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          department: r.department,
          customerName: r.customerName,
          designation: r.designation,
          landlineOrMobile: r.landlineOrMobile,
          emailId: r.emailId,
          remarks: r.remarks,
          productOrRequirements: r.productOrRequirements,
          division: r.division,
          company: r.company, // Map company field
        }));
        setReports(mappedReports);
      } catch (err: Error | unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to fetch reports: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    fetch(APIURL + '/api/reports/customer-divisions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDivisionOptions(data);
        else if (data && Array.isArray(data.divisions)) setDivisionOptions(data.divisions);
      });
    fetch(APIURL + '/api/reports/customer-companies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCompanyOptions(data);
        else if (data && Array.isArray(data.companies)) setCompanyOptions(data.companies);
      });
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesType = selectedType === 'all' || report.type === selectedType;
    const matchesSubtype = selectedType !== 'employee' || selectedSubtype === 'all' || report.subtype === selectedSubtype;
    const matchesSearch = searchQuery === '' || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || report.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchesDateRange = (!dateRange.start || new Date(report.date) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(report.date) <= new Date(dateRange.end));

    return matchesType && matchesSubtype && matchesSearch && matchesDepartment && matchesStatus && matchesDateRange;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search reports by title, content, employee name or ID..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Department Filter */}
              <select
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>

              {/* Date Range */}
              <input
                type="date"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                placeholder="Start Date"
              />
              <input
                type="date"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Report Type Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
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
                  onClick={() => setSelectedSubtype('all')}
                  className={`px-3 py-1 rounded-lg ${
                    selectedSubtype === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Employee Reports
                </button>
                {employeeSubtypes.map(subtype => (
                  <button
                    key={subtype.id}
                    onClick={() => setSelectedSubtype(subtype.id)}
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

          {/* Reports List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Division Filter Dropdown (only if customer reports exist) */}
            {filteredReports.some(r => r.type === 'customer') && (
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
                          <span className="text-xs text-blue-600 font-semibold">Division</span>
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
            {/* Customer Reports Table */}
            {filteredReports.some(r => r.type === 'customer') && (
              <div className="overflow-x-auto mb-8">
                {/* Export/Download Buttons */}
                <div className="flex justify-end mb-2 gap-2">
                  <button
                    onClick={() => {
                      // Export to CSV
                      const customerReports = filteredReports.filter(r => r.type === 'customer' && (!searchOption || r.division === searchOption || r.company === searchOption));
                      const headers = [
                        'Visited Engineer', 'DATE', 'NAME', 'DESIGNATION', 'LANDLINE / MOBILE', 'EMAIL ID', 'REMARKS', 'Product or Requirements', 'Division', 'Company'
                      ];
                      const rows = customerReports.map(report => [
                        report.employeeName || '-',
                        new Date(report.date).toLocaleDateString(),
                        report.customerName || '-',
                        report.designation || '-',
                        report.landlineOrMobile || '-',
                        report.emailId || '-',
                        report.remarks || '-',
                        report.productOrRequirements || '-',
                        report.division || '-',
                        
                      ]);
                      const csvContent = [headers, ...rows].map(e => e.map(x => `"${x}"`).join(",")).join("\n");
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'customer_reports.csv';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      // Export to PDF
                      const customerReports = filteredReports.filter(r => r.type === 'customer' && (!searchOption || r.division === searchOption || r.company === searchOption));
                      const headers = [
                        'Visited Engineer', 'Date', 'Customer Name', 'Designation', 'Landline / Moblie', 'Email Id', 'Remarks', 'Requirements', 'Division', 'Company'
                      ];
                      const rows = customerReports.map(report => [
                        report.employeeName || '-',
                        new Date(report.date).toLocaleDateString(),
                        report.customerName || '-',
                        report.designation || '-',
                        report.landlineOrMobile || '-',
                        report.emailId || '-',
                        report.remarks || '-',
                        report.productOrRequirements || '-',
                        report.division || '-',
                       
                      ]);
                      const doc = new jsPDF();
                      doc.text('Customer Reports', 14, 16);
                      autoTable(doc, {
                        head: [headers],
                        body: rows,
                        startY: 22,
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [41, 128, 185] },
                        margin: { left: 10, right: 10 }
                      });
                      doc.save('customer_reports.pdf');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Download
                  </button>
                </div>
                <table className="min-w-full border text-center">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 font-bold border">Visited Engineer</th>
                      <th className="px-4 py-2 font-bold border">Date</th>
                      <th className="px-4 py-2 font-bold border">Customer Name</th>
                      <th className="px-4 py-2 font-bold border">Designation</th>
                      <th className="px-4 py-2 font-bold border">Landline / Moblie</th>
                      <th className="px-4 py-2 font-bold border">Email Id</th>
                      <th className="px-4 py-2 font-bold border">Remarks</th>
                      <th className="px-4 py-2 font-bold border">Product or Requirements</th>
                      <th className="px-4 py-2 font-bold border">Department</th>
                     
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.filter(r => r.type === 'customer' && (!searchOption || r.division === searchOption || r.company === searchOption)).map(report => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 border">{report.employeeName || '-'}</td>
                        <td className="px-4 py-2 border">{new Date(report.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 border">{report.customerName || '-'}</td>
                        <td className="px-4 py-2 border">{report.designation || '-'}</td>
                        <td className="px-4 py-2 border">{report.landlineOrMobile || '-'}</td>
                        <td className="px-4 py-2 border">{report.emailId || '-'}</td>
                        <td className="px-4 py-2 border">{report.remarks || '-'}</td>
                        <td className="px-4 py-2 border">{report.productOrRequirements || '-'}</td>
                        <td className="px-4 py-2 border">{report.division || '-'}</td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : (
                filteredReports.filter(r => r.type !== 'customer').map(report => (
                  <div key={report.id} className="border rounded-lg p-4">
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
                            <p>Employee: {report.employeeName} ({report.employeeId})</p>
                            <p>Department: {report.department}</p>
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
                        {report.attachments && (
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>{report.content}</p>
                    </div>
                    {report.attachments && (
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
        </div>
      </div>
    </div>
  );
}
