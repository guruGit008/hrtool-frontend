'use client';

import Link from 'next/link';
import {
  Calendar,
  Package,
  Users,
  Database,
  DollarSign,
  FileText,
  MessageSquare,
  ChevronRight,
  Activity,
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { APIURL } from '@/constants/api';

interface CreateUserForm {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<CreateUserForm>({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'ADMIN'
  });

  const dashboardItems = [
    {
      id: 'attendance',
      title: 'Attendance',
      icon: Calendar,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600', // Solid gradient for icons
      bgOpacity: 'bg-blue-500/10', // Consistent opacity for card background
      darkBgOpacity: 'dark:bg-blue-600/10',
      items: ['Daily', 'Weekly', 'Monthly', 'Yearly', ],
      href: '/admin/attendence',
    },
    {
      id: 'store',
      title: 'Store',
      icon: Package,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgOpacity: 'bg-green-500/10',
      darkBgOpacity: 'dark:bg-green-600/10',
      items: ['House Keeping/Stationary', 'Lab Materials', 'Capital Office Assets'],
      href: '/admin/store',
    },
    {
      id: 'hr',
      title: 'HR',
      icon: Users,
      color: 'amber',
      gradient: 'from-amber-500 to-amber-600',
      bgOpacity: 'bg-amber-500/10',
      darkBgOpacity: 'dark:bg-amber-600/10',
      items: ['Employee Details', 'Asset Management', 'Leave Management', 'Performance', 'Joining/Relieving', 'Weekly Activities'],
      href: '/admin/hr',
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: Database,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      bgOpacity: 'bg-red-500/10',
      darkBgOpacity: 'dark:bg-red-600/10',
      items: ['Sales & Purchases', 'Logistics', 'Company Registration', 'Bank Documents', 'Billing', 'CA Doc', 'Tender Management', 'Finance reports'],
      href: '/admin/data-manager',
    },
    {
      id: 'finance',
      title: 'Finance',
      icon: DollarSign,
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      bgOpacity: 'bg-indigo-500/10',
      darkBgOpacity: 'dark:bg-indigo-600/10',
      items: ['Fixed Expenses', 'Variable Expenses'],
      href: '/admin/finance-manager/dashboard',
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: FileText,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgOpacity: 'bg-purple-500/10',
      darkBgOpacity: 'dark:bg-purple-600/10',
      items: ['Employee Reports', 'Visit Report', 'OEM Report', 'Customer Report', 'Blueprint Reports', 'Projection Reports', 'Projection Achieved Reports', 'Visit Inquiries', 'BQ Quatitions'],
      href: '/admin/reports',
    },
    {
      id: 'memo',
      title: 'Memo',
      icon: MessageSquare,
      color: 'teal',
      gradient: 'from-teal-500 to-teal-600',
      bgOpacity: 'bg-teal-500/10',
      darkBgOpacity: 'dark:bg-teal-600/10',
      items: ['Admin Memos', 'Employee Notices'],
      href: '/admin/memos',
    },
  ];

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(APIURL +'/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('User created successfully!');
        console.log('token');
        console.log('User created successfully!');
        
        
        setFormData({
          username: '',
          password: '',
          fullName: '',
          email: '',
          role: 'ADMIN'
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to fetch documents: ${e.message}`);
      } else {
        setError('Failed to fetch documents: Unknown error occurred.');
      }
    
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 dark:bg-blue-500 shadow-md mb-6">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white tracking-tight mb-4">
            Admin Overview
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
            Centralized access to all organizational management tools.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dashboardItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group h-full"
              >
                <div className={`h-full relative overflow-hidden rounded-2xl p-7 shadow-lg backdrop-blur-xl
                  ${item.bgOpacity} ${item.darkBgOpacity}
                  border border-white/20 dark:border-gray-700/50
                  transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300 ease-in-out`}>

                  {/* Top Section: Icon and Title */}
                  <div className="flex items-center mb-5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300
                      bg-gradient-to-br ${item.gradient}
                      transform group-hover:scale-110 group-hover:shadow-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  {/* Sub-items List */}
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {item.items.map((subItem, index) => (
                      <div key={index} className="flex items-center">
                        <ChevronRight className="w-3.5 h-3.5 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="line-clamp-1">{subItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
        
        </div>

        {/* Create User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center mb-6">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new user account</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="STORE">Inventory Control Panel</option>
                    <option value="HR">HR</option>
                    <option value="DATAMANAGER">Data Manager</option>
                    <option value="FINANCEMANAGER">Finance Manager</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}