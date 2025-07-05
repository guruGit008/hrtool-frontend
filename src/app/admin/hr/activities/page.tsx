'use client';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
 
  
  X, 
  Calendar,
  Clock,
  
  Eye,
 
  User
} from 'lucide-react';
import { APIURL } from '@/constants/api';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  notes?: string;
}

// Define the API response interface
interface ApiActivityResponse {
  id: string;
  title: string;
  description: string;
  activityDate: string;
  activityTime: string;
  status: string; // "Pending", "In Progress", "Completed"
  assignedTo: string;
  priority: string; // "Low Priority", "Medium Priority", "High Priority"
  category: string;
  notes?: string;
}

// Define the API request interface
interface ApiActivityRequest {
  title: string;
  description: string;
  activityDate: string;
  activityTime: string;
  status: string; // "Pending", "In Progress", "Completed"
  assignedTo: string;
  priority: string; // "Low Priority", "Medium Priority", "High Priority"
  category: string;
  notes?: string;
}

// Transformation from client-side Activity (without id) to API request format
const transformActivityToApiRequest = (activity: Omit<Activity, 'id'>): ApiActivityRequest => ({
  title: activity.title,
  description: activity.description,
  activityDate: activity.date,
  activityTime: activity.time,
  status: activity.status.charAt(0).toUpperCase() + activity.status.slice(1),
  assignedTo: activity.assignedTo,
  priority: activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1) + ' Priority',
  category: activity.category,
  notes: activity.notes,
});

// Transformation from API response to client-side Activity format
const transformActivityFromApiResponse = (apiActivity: ApiActivityResponse): Activity => ({
  id: apiActivity.id,
  title: apiActivity.title,
  description: apiActivity.description,
  date: apiActivity.activityDate,
  time: apiActivity.activityTime,
  status: apiActivity.status.toLowerCase() as Activity['status'],
  assignedTo: apiActivity.assignedTo,
  priority: apiActivity.priority.replace(' Priority', '').toLowerCase() as Activity['priority'],
  category: apiActivity.category,
  notes: apiActivity.notes,
});

type ModalType = 'add' | 'edit' | 'view';

const API_BASE_URL = APIURL +'/api/activities';

const activitiesAPI = {
  getAll: async (): Promise<Activity[]> => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch activities');
    const data: ApiActivityResponse[] = await res.json();
    return data.map(transformActivityFromApiResponse);
  },

  create: async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
    const apiRequest = transformActivityToApiRequest(activity);
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiRequest),
    });
    if (!res.ok) throw new Error('Failed to create activity');
    const data: ApiActivityResponse = await res.json();
    return transformActivityFromApiResponse(data);
  },

  update: async (id: string, activity: Omit<Activity, 'id'>): Promise<Activity> => {
    const apiRequest = transformActivityToApiRequest(activity);
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiRequest),
    });
    if (!res.ok) throw new Error('Failed to update activity');
    const data: ApiActivityResponse = await res.json();
    return transformActivityFromApiResponse(data);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete activity');
  },
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('add');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<Partial<Activity>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const isEditMode = modalType === 'edit';
  const isViewMode = modalType === 'view';

  // Fetch activities on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await activitiesAPI.getAll();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch activities');
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const openModal = (type: ModalType, activity?: Activity) => {
    setModalType(type);
    setSelectedActivity(activity || null);
    if (type === 'add') {
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        status: 'pending',
        assignedTo: '',
        priority: 'medium',
        category: '',
        notes: ''
      });
    } else if (activity) {
      setFormData({ ...activity });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedActivity(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.assignedTo || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (modalType === 'add') {
        const newActivity = await activitiesAPI.create(formData as Omit<Activity, 'id'>);
        setActivities([...activities, newActivity]);
      } else if (modalType === 'edit' && selectedActivity) {
        const updatedActivity = await activitiesAPI.update(selectedActivity.id, formData as Omit<Activity, 'id'>);
        setActivities(activities.map(activity => 
          activity.id === selectedActivity.id ? updatedActivity : activity
        ));
      }
      closeModal();
    } catch (error) {
      console.error('Error saving activity:', error);
      alert(error instanceof Error ? error.message : 'Failed to save activity');
    }
  };

 

  const handleStatusChange = async (id: string, newStatus: Activity['status']) => {
    try {
      const activity = activities.find(a => a.id === id);
      if (!activity) return;

      const updatedActivity = await activitiesAPI.update(id, {
        ...activity,
        status: newStatus
      });
      
      setActivities(activities.map(activity => 
        activity.id === id ? updatedActivity : activity
      ));
    } catch (error) {
      console.error('Error updating activity status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update activity status');
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['all', ...new Set(activities.map(a => a.category))];
  const statuses = ['all', 'pending', 'in-progress', 'completed'];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading activities...</div>
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Activities</h1>
       
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
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
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                activity.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{activity.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {activity.date} at {activity.time}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                {activity.assignedTo}
              </div>
              <div className="flex items-center text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                  activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)} Priority
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => openModal('view', activity)}
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
                  
                  {modalType === 'view' && 'Activity Details'}
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
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Title</p>
                      <p className="font-medium">{selectedActivity?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium">{selectedActivity?.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium">{selectedActivity?.date} at {selectedActivity?.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Assigned To</p>
                      <p className="font-medium">{selectedActivity?.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium">{selectedActivity?.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Priority</p>
                      <p className="font-medium">{selectedActivity?.priority}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="text-gray-900">{selectedActivity?.description}</p>
                  </div>

                  {selectedActivity?.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Notes</p>
                      <p className="text-gray-900">{selectedActivity.notes}</p>
                    </div>
                  )}

                  {isEditMode && (
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => handleStatusChange(selectedActivity!.id, 'completed')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark as Completed
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedActivity!.id, 'in-progress')}
                        className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Mark as In Progress
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.date || ''}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.time || ''}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.assignedTo || ''}
                        onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.priority || 'medium'}
                        onChange={(e) => setFormData({...formData, priority: e.target.value as Activity['priority']})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.status || 'pending'}
                        onChange={(e) => setFormData({...formData, status: e.target.value as Activity['status']})}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Add any additional notes..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {modalType === 'add' ? 'Add Activity' : 'Update Activity'}
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