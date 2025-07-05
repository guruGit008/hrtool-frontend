'use client';
import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  EyeOff
} from 'lucide-react';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
 
interface Employee {
  id: string;
  employeeId: string;
  employeeName: string;
  email: string;
  password:string;
  phoneNumber: string;
  bloodGroup: string;
  profilePhotoUrl: string | null;
  currentAddress: string;
  permanentAddress: string;
  position: string;
  department: string;
  joiningDate: string; // YYYY-MM-DD
  status: 'Active' | 'Joining' | 'Relieving';
 
}
 
interface ApiEmployeeResponse extends Omit<Employee, 'joiningDate' | 'status'> {
  joiningDate: [number, number, number];
  status: string;
}
 
const transformEmployeeFromApiResponse = (apiEmployee: ApiEmployeeResponse): Employee => ({
  id: apiEmployee.id,
  employeeId: apiEmployee.employeeId,
  employeeName: apiEmployee.employeeName,
  email: apiEmployee.email,
  password:apiEmployee.password,
  phoneNumber: apiEmployee.phoneNumber,
  bloodGroup: apiEmployee.bloodGroup,
  currentAddress: apiEmployee.currentAddress,
  permanentAddress: apiEmployee.permanentAddress,
  position: apiEmployee.position,
  department: apiEmployee.department,
  joiningDate: new Date(apiEmployee.joiningDate[0], apiEmployee.joiningDate[1] - 1, apiEmployee.joiningDate[2]).toISOString().split('T')[0],
  status: apiEmployee.status as Employee['status'],
  profilePhotoUrl: apiEmployee.profilePhotoUrl,
});
 
const API_ORIGIN = APIURL ;
const API_BASE_URL = `${API_ORIGIN}/api/employees`;
 
const employeesAPI = {
  getAll: async (): Promise<Employee[]> => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch employees');
    const data: ApiEmployeeResponse[] = await res.json();
    return data.map(transformEmployeeFromApiResponse);
  },
 
  create: async (employee: Omit<Employee, 'id'>, profilePhotoFile?: File | null): Promise<Employee> => {
    const formData = new FormData();
    formData.append('employee', JSON.stringify(employee));
    if (profilePhotoFile) {
      formData.append('photo', profilePhotoFile);
    }
   
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });
 
    if (!res.ok) throw new Error('Failed to create employee');
    const data: ApiEmployeeResponse = await res.json();
    return transformEmployeeFromApiResponse(data);
  },
 
  update: async (id: string, employee: Omit<Employee, 'id'>, profilePhotoFile?: File | null): Promise<Employee> => {
    const formData = new FormData();
    formData.append('employee', JSON.stringify(employee));
    if (profilePhotoFile) {
      formData.append('photo', profilePhotoFile);
    }
 
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: formData,
    });
 
    if (!res.ok) throw new Error('Failed to update employee');
    const data: ApiEmployeeResponse = await res.json();
    return transformEmployeeFromApiResponse(data);
  },
 
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete employee');
  },
};
 
type ModalType = 'add' | 'edit' | 'view';
 
export default function JoiningPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('add');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const departmentOptions = [
    '', 'HR', 'Finance', 'Sales', 'IT', 'Logistics', 'Admin', 'Other'
  ];
  const bloodGroupOptions = [
    '', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];
  const [formError, setFormError] = useState('');
 
  const isViewMode = modalType === 'view';
 
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await employeesAPI.getAll();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch employees');
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);
 
  const openModal = (type: ModalType, employee?: Employee) => {
    setModalType(type);
    setSelectedEmployee(employee || null);
    setProfilePhotoFile(null);
    setProfilePhotoPreview(null);
    if (type === 'add') {
      setFormData({
        employeeId: '',
        employeeName: '',
        email: '',
        password:'',
        phoneNumber: '',
        bloodGroup: '',
        currentAddress: '',
        permanentAddress: '',
        position: '',
        department: '',
        joiningDate: '',
        status: 'Active',
        profilePhotoUrl: '',
      });
    } else if (employee) {
      setFormData({ ...employee });
      if (employee.profilePhotoUrl) {
        setProfilePhotoPreview(`${API_ORIGIN}${employee.profilePhotoUrl}`);
      }
    }
    setShowModal(true);
  };
 
  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setFormData({});
    setProfilePhotoFile(null);
    setProfilePhotoPreview(null);
  };
 
  const handleSubmit = async () => {
    setFormError('');
    if (!formData.employeeId || !formData.employeeName || !formData.email || !formData.password || !formData.phoneNumber || !formData.position || !formData.department || !formData.joiningDate || !formData.bloodGroup) {
      setFormError('Please fill in all required fields.');
      return;
    }
    try {
      if (modalType === 'add') {
        const newEmployee = await employeesAPI.create(formData as Omit<Employee, 'id'>, profilePhotoFile);
        setEmployees([...employees, newEmployee]);
        toast.success('Employee added successfully');
      } else if (modalType === 'edit' && selectedEmployee) {
        const updatedEmployee = await employeesAPI.update(selectedEmployee.id, formData as Omit<Employee, 'id'>, profilePhotoFile);
        setEmployees(employees.map(employee =>
          employee.id === selectedEmployee.id ? updatedEmployee : employee
        ));
        toast.success('Employee updated successfully');
      }
      closeModal();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save employee');
    }
  };
 
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      try {
        await employeesAPI.delete(id);
        setEmployees(employees.filter(employee => employee.id !== id));
        toast.success('Employee deleted successfully');
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete employee');
      }
    }
  };
 
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });
 
  const departments = ['all', ...new Set(employees.map(e => e.department))];
  const statuses = ['all', 'Active', 'Joining', 'Relieving'];
 
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading employees...</div>
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }
 
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <button
            onClick={() => openModal('add')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Employee</span>
          </button>
        </div>
 
        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map(department => (
                  <option key={department} value={department}>
                    {department === 'all' ? 'All Departments' : department}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
 
        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="flex items-center mb-4">
                {employee.profilePhotoUrl ? (
                  <Image src={`${API_ORIGIN}${employee.profilePhotoUrl}`} alt={employee.employeeName} width={64} height={64} className="w-16 h-16 rounded-full object-cover mr-4" />
                ) : (
                  <div className="w-16 h-16 mr-4 shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{employee.employeeName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {employee.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{employee.position}</p>
                </div>
              </div>
 
              <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>{employee.employeeId}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined: {employee.joiningDate}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{employee.phoneNumber}</span>
                </div>
              </div>
 
              <div className="flex space-x-2 mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModal('view', employee)}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => openModal('edit', employee)}
                  className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
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
                    {modalType === 'add' && 'Add New Employee'}
                    {modalType === 'edit' && 'Edit Employee'}
                    {modalType === 'view' && 'Employee Details'}
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
                {isViewMode ? (
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      {selectedEmployee?.profilePhotoUrl ? (
                        <Image src={`${API_ORIGIN}${selectedEmployee.profilePhotoUrl}`} alt={selectedEmployee.employeeName || 'Employee'} width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Employee ID</p>
                        <p className="font-medium">{selectedEmployee?.employeeId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{selectedEmployee?.employeeName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedEmployee?.email}</p>
                      </div>
                     
                      <div>
                        <p className="text-sm text-gray-600">Password</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{showPassword ? selectedEmployee?.password : '••••••••'}</p>
                          <button
                            onClick={togglePasswordVisibility}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium">{selectedEmployee?.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium">{selectedEmployee?.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-medium">{selectedEmployee?.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Joining Date</p>
                        <p className="font-medium">{selectedEmployee?.joiningDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium">{selectedEmployee?.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Blood Group</p>
                        <p className="font-medium">{selectedEmployee?.bloodGroup}</p>
                      </div>
                    </div>
 
                    <div>
                      <p className="text-sm text-gray-600">Current Address</p>
                      <p className="font-medium">{selectedEmployee?.currentAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Permanent Address</p>
                      <p className="font-medium">{selectedEmployee?.permanentAddress}</p>
                    </div>
 
                 
                  </div>
 
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.employeeId || ''}
                          onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.employeeName || ''}
                          onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.password || ''}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.phoneNumber || ''}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.position || ''}
                          onChange={(e) => setFormData({...formData, position: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.department || ''}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                        >
                          {departmentOptions.map(opt => (
                            <option key={opt} value={opt}>{opt ? opt : 'Select department'}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.joiningDate || ''}
                          onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.status || 'Active'}
                          onChange={(e) => setFormData({...formData, status: e.target.value as Employee['status']})}
                        >
                          <option value="Active">Active</option>
                          <option value="Joining">Joining</option>
                          <option value="Relieving">Relieving</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.bloodGroup || ''}
                          onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                        >
                          {bloodGroupOptions.map(opt => (
                            <option key={opt} value={opt}>{opt ? opt : 'Select blood group'}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                        <div className="flex items-center space-x-3">
                          <input
                            id="profile-photo-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setProfilePhotoFile(file);
                                setProfilePhotoPreview(URL.createObjectURL(file));
                              } else {
                                setProfilePhotoFile(null);
                                setProfilePhotoPreview(selectedEmployee?.profilePhotoUrl ? `${API_ORIGIN}${selectedEmployee.profilePhotoUrl}` : null);
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('profile-photo-input')?.click()}
                            className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            <span>Select Photo</span>
                          </button>
                        </div>
                        {profilePhotoPreview && (
                          <Image
                            src={profilePhotoPreview}
                            alt="Profile Preview"
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full mt-2 object-cover"
                          />
                        )}
                      </div>
                    </div>
 
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.currentAddress || ''}
                        onChange={(e) => setFormData({...formData, currentAddress: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.permanentAddress || ''}
                        onChange={(e) => setFormData({...formData, permanentAddress: e.target.value})}
                      />
                    </div>
                 
                    {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={
                          !formData.employeeId ||
                          !formData.employeeName ||
                          !formData.email ||
                          !formData.password ||
                          !formData.phoneNumber ||
                          !formData.position ||
                          !formData.department ||
                          !formData.joiningDate ||
                          !formData.bloodGroup
                        }
                      >
                        {modalType === 'add' ? 'Add Employee' : 'Update Employee'}
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
    </div>
  );
}
 