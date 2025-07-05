'use client';
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  AlertCircle,
  XCircle,
  Clock,

  Search,
  Bell
} from 'lucide-react';

interface Memo {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'warning' | 'notice' | 'general';
  priority: 'high' | 'medium' | 'low';
  sender: string;
  recipients: string[];
  createdAt: string;
  status: 'sent' | 'draft';
  read?: boolean;
}

export default function MemoViewer() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Sample data initialization
  useEffect(() => {
    const sampleMemos: Memo[] = [
      {
        id: '1',
        title: 'Company Holiday Announcement',
        content: 'The office will be closed on March 25th for Holi celebration.',
        type: 'announcement',
        priority: 'high',
        sender: 'Admin',
        recipients: ['1', '2', '3', '4', '5', '6', '7', '8'],
        createdAt: new Date().toISOString(),
        status: 'sent',
        read: false
      },
      {
        id: '2',
        title: 'New HR Policy Update',
        content: 'Please review the updated HR policies in the employee portal.',
        type: 'notice',
        priority: 'medium',
        sender: 'Admin',
        recipients: ['1', '2', '3', '4', '5', '6', '7', '8'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'sent',
        read: true
      },
      {
        id: '3',
        title: 'Important: System Maintenance',
        content: 'The company systems will be under maintenance this weekend.',
        type: 'warning',
        priority: 'high',
        sender: 'Admin',
        recipients: ['1', '2', '3', '4', '5', '6', '7', '8'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'sent',
        read: false
      }
    ];

    setMemos(sampleMemos);
    setFilteredMemos(sampleMemos);
    setUnreadCount(sampleMemos.filter(memo => !memo.read).length);
  }, []);

  useEffect(() => {
    let filtered = memos;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(memo =>
        memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memo.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(memo => memo.type === selectedType);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(memo => memo.priority === selectedPriority);
    }

    setFilteredMemos(filtered);
  }, [memos, searchTerm, selectedType, selectedPriority]);

  const handleMemoClick = (memoId: string) => {
    setMemos(prevMemos =>
      prevMemos.map(memo =>
        memo.id === memoId ? { ...memo, read: true } : memo
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getPriorityColor = (priority: Memo['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: Memo['type']) => {
    switch (type) {
      case 'announcement':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <XCircle className="w-4 h-4" />;
      case 'notice':
        return <Clock className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Memos & Notices</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Bell className="w-3 h-3 mr-1" />
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search memos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="announcement">Announcements</option>
              <option value="warning">Warnings</option>
              <option value="notice">Notices</option>
              <option value="general">General</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredMemos.map(memo => (
          <div
            key={memo.id}
            onClick={() => handleMemoClick(memo.id)}
            className={`p-6 cursor-pointer transition-colors ${
              !memo.read ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">{memo.title}</h3>
                  {!memo.read && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  From {memo.sender} • {new Date(memo.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(memo.priority)}`}>
                  {memo.priority} Priority
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                  {getTypeIcon(memo.type)}
                  <span className="ml-1 capitalize">{memo.type}</span>
                </span>
              </div>
            </div>
            <p className="mt-4 text-gray-700">{memo.content}</p>
          </div>
        ))}

        {filteredMemos.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No memos found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
} 