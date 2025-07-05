'use client';
import React, { useState, useEffect } from 'react';
import { Award,  Star, Search, Filter,  Eye,  X, User, Building } from 'lucide-react';
import { APIURL } from '@/constants/api';

interface Employee {
  id?: number;
  employeeId?: string;
  employeeName?: string;
  position?: string;
  department?: string;
  email?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  profilePhotoUrl?: string | null;
  currentAddress?: string;
  permanentAddress?: string;
  joiningDate?: string;
  relievingDate?: string | null;
  status?: string;
}

interface PerformanceReview {
  id?: number;
  employee: Employee;
  reviewStatus: 'PENDING' | 'COMPLETED' | 'pending' | 'completed';
  rating: number;
  lastReviewDate: string;
  nextReviewDate: string;
  goals?: string;
  feedback?: string;
  achievements?: string;
  reviewer: string;
}

const API_BASE_URL = APIURL +'/api';

export default function PerformanceManagement() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [formData, setFormData] = useState<Partial<PerformanceReview>>({
    employee: {
      id: 0,
      employeeId: '',
      employeeName: '',
      position: '',
      department: '',
      email: '',
      phoneNumber: '',
      bloodGroup: '',
      profilePhotoUrl: null,
      currentAddress: '',
      permanentAddress: '',
      joiningDate: '',
      relievingDate: null,
      status: 'Active'
    } as Employee,
    reviewStatus: 'pending',
    rating: 0,
    lastReviewDate: '',
    nextReviewDate: '',
    goals: '',
    feedback: '',
    achievements: '',
    reviewer: ''
  });

  // Fetch all performance reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/performance-reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    return status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (status: string | undefined) => {
    if (!status) return 'unknown';
    return status.toLowerCase();
  };

  const openModal = (type: 'add' | 'edit' | 'view', review?: PerformanceReview) => {
    setModalType(type);
    setSelectedReview(review || null);
    if (type === 'add') {
      setFormData({
        employee: {
          id: 0,
          employeeId: '',
          employeeName: '',
          position: '',
          department: '',
          email: '',
          phoneNumber: '',
          bloodGroup: '',
          profilePhotoUrl: null,
          currentAddress: '',
          permanentAddress: '',
          joiningDate: '',
          relievingDate: null,
          status: 'Active'
        } as Employee,
        reviewStatus: 'pending',
        rating: 0,
        lastReviewDate: '',
        nextReviewDate: '',
        goals: '',
        feedback: '',
        achievements: '',
        reviewer: ''
      });
    } else if (review) {
      setFormData({ ...review });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReview(null);
    setFormData({});
  };

  const updateEmployeeField = (field: keyof Employee, value: string) => {
    setFormData(prev => ({
      ...prev,
      employee: {
        ...prev.employee,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.employee?.employeeId || !formData.employee?.employeeName || 
          !formData.employee?.position || !formData.employee?.department || 
          !formData.rating || !formData.reviewStatus) {
        alert('Please fill in all required fields');
        return;
      }

      const reviewData = {
        ...formData,
        employee: {
          ...formData.employee,
          id: formData.employee.id || 0,
          status: formData.employee.status || 'Active'
        },
        reviewStatus: formData.reviewStatus?.toUpperCase(),
      };

      if (modalType === 'add') {
        const response = await fetch(`${API_BASE_URL}/performance-reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
          throw new Error('Failed to add review');
        }

        const newReview = await response.json();
        setReviews([...reviews, newReview]);
      } else if (modalType === 'edit' && selectedReview) {
        const response = await fetch(`${API_BASE_URL}/performance-reviews/${selectedReview.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
          throw new Error('Failed to update review');
        }

        const updatedReview = await response.json();
        setReviews(reviews.map(review => 
          review.id === selectedReview.id ? updatedReview : review
        ));
      }
      
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      alert('Failed to save review. Please try again.');
    }
  };



  const filteredReviews = reviews.filter(review =>
    (review.employee?.employeeName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (review.employee?.position?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (review.employee?.department?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading performance reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Performance Management</h1>
       
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search performance reviews..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Performance Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.reviewStatus)}`}>
                {getStatusText(review.reviewStatus)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.employee.employeeName}</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Employee ID:</span> {review.employee.employeeId}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Position:</span> {review.employee.position}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Department:</span> {review.employee.department}
              </p>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-600">Rating:</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(review.rating)
                          ? getRatingColor(review.rating)
                          : 'text-gray-300'
                      }`}
                      fill={i < Math.floor(review.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                  <span className={`ml-2 text-sm font-medium ${getRatingColor(review.rating)}`}>
                    {review.rating}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Last Review:</span> {review.lastReviewDate}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Next Review:</span> {review.nextReviewDate}
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => openModal('view', review)}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
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
                 
                  {modalType === 'view' && 'Performance Review Details'}
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
              {modalType === 'view' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Employee ID</p>
                        <p className="font-medium">{selectedReview?.employee.employeeId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Employee Name</p>
                        <p className="font-medium">{selectedReview?.employee.employeeName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-medium">{selectedReview?.employee.department}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-medium">{selectedReview?.employee.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReview?.reviewStatus)}`}>
                        {getStatusText(selectedReview?.reviewStatus)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(selectedReview?.rating || 0)
                                  ? getRatingColor(selectedReview?.rating || 0)
                                  : 'text-gray-300'
                              }`}
                              fill={i < Math.floor(selectedReview?.rating || 0) ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{selectedReview?.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Last Review</p>
                      <p className="font-medium">{selectedReview?.lastReviewDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Review</p>
                      <p className="font-medium">{selectedReview?.nextReviewDate}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Goals</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedReview?.goals || 'No goals specified'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Feedback</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedReview?.feedback || 'No feedback provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Achievements</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedReview?.achievements || 'No achievements recorded'}</p>
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
                        value={formData.employee?.employeeId || ''}
                        onChange={(e) => updateEmployeeField('employeeId', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.employee?.employeeName || ''}
                        onChange={(e) => updateEmployeeField('employeeName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.employee?.position || ''}
                        onChange={(e) => updateEmployeeField('position', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.employee?.department || ''}
                        onChange={(e) => updateEmployeeField('department', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.rating || ''}
                        onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                      >
                        <option value="">Select Rating</option>
                        <option value="1">1.0</option>
                        <option value="1.5">1.5</option>
                        <option value="2">2.0</option>
                        <option value="2.5">2.5</option>
                        <option value="3">3.0</option>
                        <option value="3.5">3.5</option>
                        <option value="4">4.0</option>
                        <option value="4.5">4.5</option>
                        <option value="5">5.0</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.employee?.status || ''}
                        onChange={(e) => setFormData({...formData, employee: {...formData.employee, status: e.target.value}})}
                      >
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Review Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.lastReviewDate || ''}
                        onChange={(e) => setFormData({...formData, lastReviewDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Next Review Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.nextReviewDate || ''}
                        onChange={(e) => setFormData({...formData, nextReviewDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.reviewer || ''}
                        onChange={(e) => setFormData({...formData, reviewer: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.goals || ''}
                      onChange={(e) => setFormData({...formData, goals: e.target.value})}
                      placeholder="Enter performance goals..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.feedback || ''}
                      onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                      placeholder="Enter feedback..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.achievements || ''}
                      onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                      placeholder="Enter achievements..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {modalType === 'add' ? 'Add Review' : 'Update Review'}
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
  );
}