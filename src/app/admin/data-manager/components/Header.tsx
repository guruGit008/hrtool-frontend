import { useState } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  time: string;
}

export default function Header({ title, handleLogout }: { title: string; handleLogout: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'New purchase order received', time: '2 min ago' },
    { id: 2, message: 'Bank guarantee updated', time: '1 hour ago' },
    { id: 3, message: 'Tender document uploaded', time: '3 hours ago' }
  ]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={handleNotificationClick}
              className="p-2 text-gray-500 hover:text-gray-700 relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className="flex items-start justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div>
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                        <button
                          onClick={() => handleMarkNotificationAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
} 