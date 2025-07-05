'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  FileText,
  Clock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
 
  Laptop,
  User,
  X,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { APIURL } from '@/constants/api';
 
interface QuickLink {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}
 
interface Employee {
  employeeName: string;
  employeeId: string;
  position: string;
  department: string;
  email: string;
  phoneNumber: string;
  bloodGroup: string;
  profilePhotoUrl: string;
  currentAddress: string;
  permanentAddress: string;
  joiningDate: string;
  relievingDate: string;
  status: string;
}
 
export default function EmployeeDashboard() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState({
    employeeName: '',
    employeeId:'',
    position: '',
    department: '',
    email: '',
    phoneNumber: '',
    bloodGroup: '',
    profilePhotoUrl: '',
    currentAddress: '',
    permanentAddress: '',
    joiningDate: '',
    relievingDate: '',
    status: ''
  });
  const [profilePhoto, setProfilePhoto] = useState('');
 
  const quickLinks: QuickLink[] = [
    {
      title: 'Attendance',
      description: 'Track your daily attendance and view history',
      icon: <Clock className="w-6 h-6" />,
      href: '/employee/attendance',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Memos',
      description: 'View memos and announcements sent to you',
      icon: <MessageSquare className="w-6 h-6" />,
      href: '/employee/memos',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'Documents',
      description: 'Manage your important documents',
      icon: <FileText className="w-6 h-6" />,
      href: '/employee/documents',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Assets',
      description: 'View and manage your assigned assets',
      icon: <Laptop className="w-6 h-6" />,
      href: '/employee/assets',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Leaves',
      description: 'Request and track your leaves',
      icon: <Calendar className="w-6 h-6" />,
      href: '/employee/leaves',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Performance',
      description: 'Track your career growth and achievements',
      icon: <Star className="w-6 h-6" />,
      href: '/employee/performance',
      color: 'bg-red-100 text-red-600'
    },
    {
      title: 'Reports',
      description: 'Manage and view your reports',
      icon: <FileText className="w-6 h-6" />,
      href: '/employee/reports',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];
 
  const fetchEmployee = useCallback(async () => {
    setLoading(true);
    setError(null);
    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) {
      router.replace("/login");
      return;
    }
    try {
      const res = await fetch(APIURL +`/api/employees/byEmployeeId/${employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch employee data");
      const data = await res.json();
      setEmployee(data);
      setEditedProfile({
        employeeName: data.employeeName || '',
        employeeId:data.employeeId || '',
        position: data.position || '',
        department: data.department || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        bloodGroup: data.bloodGroup || '',
        profilePhotoUrl: data.profilePhotoUrl || '',
        currentAddress: data.currentAddress || '',
        permanentAddress: data.permanentAddress || '',
        joiningDate: data.joiningDate || '',
        relievingDate: data.relievingDate || '',
        status: data.status || ''
      });
      if (data.profilePhotoUrl) {
        setProfilePhoto(APIURL +`${data.profilePhotoUrl}`);
      } else {
        setProfilePhoto('');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error fetching employee data");
    } finally {
      setLoading(false);
    }
  }, [router]);
 
  useEffect(() => {
    fetchEmployee();
  }, [router, fetchEmployee]);
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-700">Loading employee profile...</div>
      </div>
    );
  }
 
  const handleCancel = () => {
    if (!employee) return;
    setEditedProfile({
      employeeName: employee.employeeName,
      employeeId:employee.employeeId,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      bloodGroup: employee.bloodGroup,
      profilePhotoUrl: employee.profilePhotoUrl,
      currentAddress: employee.currentAddress,
      permanentAddress: employee.permanentAddress,
      joiningDate: employee.joiningDate,
      relievingDate: employee.relievingDate,
      status: employee.status
    });
    setIsEditing(false);
  };
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
 
  if (error || !employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
        {error || 'Employee not found.'}
        <button
          onClick={() => { setError(null); fetchEmployee(); }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 relative overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt={employee.employeeName}
                    fill
                    sizes="96px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
             
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                {isEditing ? (
                  <div className="space-y-4 w-full">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="employeeName"
                        value={editedProfile.employeeName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <input
                        type="text"
                        name="position"
                        value={editedProfile.position}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={editedProfile.department}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editedProfile.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editedProfile.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                      <input
                        type="text"
                        name="bloodGroup"
                        value={editedProfile.bloodGroup}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Address</label>
                      <input
                        type="text"
                        name="currentAddress"
                        value={editedProfile.currentAddress}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                      <input
                        type="text"
                        name="permanentAddress"
                        value={editedProfile.permanentAddress}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                      <input
                        type="date"
                        name="joiningDate"
                        value={editedProfile.joiningDate ? editedProfile.joiningDate.slice(0, 10) : ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Relieving Date</label>
                      <input
                        type="date"
                        name="relievingDate"
                        value={editedProfile.relievingDate ? editedProfile.relievingDate.slice(0, 10) : ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <input
                        type="text"
                        name="status"
                        value={editedProfile.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                     
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{employee.employeeName}</h1>
                      <p className="text-gray-600">{employee.position} • {employee.department}</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{employee.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{employee.phoneNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{employee.currentAddress}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{employee.employeeId}</span>

                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">Blood Group:</span>
                          <span className="text-gray-600">{employee.bloodGroup}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">Permanent Address:</span>
                          <span className="text-gray-600">{employee.permanentAddress}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">Joining Date:</span>
                          <span className="text-gray-600">{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : '-'}</span>
                        </div>
                     
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">Status:</span>
                          <span className="text-gray-600">{employee.status}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                     
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
 
        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="block p-6 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${link.color}`}>
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
 