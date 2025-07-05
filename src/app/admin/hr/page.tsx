'use client';
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  
  CheckCircle, 
  TrendingUp, 
  Award, 
  UserPlus, 
  LucideIcon,
  Building,
  GraduationCap,
  Briefcase, 
 
} from 'lucide-react';
import { Employee } from './types';
import { APIURL } from '@/constants/api';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  trend?: string;
  color?: string;
  bgColor?: string;
}

interface Activity {
  icon: LucideIcon;
  title: string;
  time: string;
  status: 'completed' | 'pending' | 'rejected';
}

interface RecentActivityProps {
  icon: LucideIcon;
  title: string;
  time: string;
  status: 'completed' | 'pending' | 'rejected';
}

// Map string icon names to Lucide icon components
const iconMap: { [key: string]: LucideIcon } = {
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  UserPlus,
  Building,
  GraduationCap,
  Briefcase,
  // Add more icons here if needed
};

export default function HRDashboard() {
  // State for stats
  const [totalWorkforce, setTotalWorkforce] = useState<number | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [newHires, setNewHires] = useState<number | null>(null);
  const [openPositions, setOpenPositions] = useState<number | null>(null); // Placeholder
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // State for recent activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [errorActivities, setErrorActivities] = useState<string | null>(null);

  useEffect(() => {
    setLoadingStats(true);
    setErrorStats(null);
    fetch(APIURL +'/api/employees')
      .then(res => res.json())
      .then((data: Employee[]) => {
        setTotalWorkforce(data.length);
        setDepartments(Array.from(new Set(data.map((e) => (e as { department?: string }).department ?? ''))));
        // New hires in last 30 days
        const now = new Date();
        const hires = data.filter((e) => {
          if (!e.joinDate) return false;
          const joinDate = new Date(e.joinDate);
          return (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
        });
        setNewHires(hires.length);
        setOpenPositions(null);
      })
      .catch(() => setErrorStats('Failed to fetch employee data'))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoadingActivities(true);
    setErrorActivities(null);
    fetch(APIURL +'/api/activities')
      .then(res => res.json())
      .then((data: Activity[]) => {
        // Map icon string to actual component
        const mapped = data.slice(0, 5).map(activity => ({
          ...activity,
          icon: iconMap[(activity.icon as unknown as string)] || Users, // fallback to Users if not found
        }));
        setActivities(mapped);
      })
      .catch(() => setErrorActivities('Failed to fetch activities'))
      .finally(() => setLoadingActivities(false));
  }, []);

  const StatCard = ({ icon: Icon, title, value, trend, color = 'blue', bgColor = 'bg-blue-50' }: StatCardProps) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${bgColor}`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  // const QuickActionCard = ({ icon: Icon, title, description, color = 'blue', path }: QuickActionCardProps) => (
  //   <a 
  //     href={path}
  //     className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group block"
  //   >
  //     <div className={`p-3 rounded-lg bg-${color}-50 w-fit mb-4 group-hover:bg-${color}-100 transition-colors`}>
  //       <Icon className={`w-6 h-6 text-${color}-600`} />
  //     </div>
  //     <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
  //     <p className="text-sm text-gray-600">{description}</p>
  //   </a>
  // );

  const RecentActivity = ({ icon: Icon, title, time, status }: RecentActivityProps) => (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="p-2 rounded-lg bg-blue-50">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === 'completed' ? 'bg-green-100 text-green-800' :
        status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {status}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="Total Workforce"
              value={loadingStats ? '...' : errorStats ? '!' : totalWorkforce?.toString() || '0'}
              trend=""
              color="blue"
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={Building}
              title="Departments"
              value={loadingStats ? '...' : errorStats ? '!' : departments.length.toString()}
              trend=""
              color="purple"
              bgColor="bg-purple-50"
            />
            <StatCard
              icon={GraduationCap}
              title="Open Positions"
              value={openPositions !== null ? openPositions.toString() : 'N/A'}
              trend=""
              color="green"
              bgColor="bg-green-50"
            />
            <StatCard
              icon={Briefcase}
              title="New Hires"
              value={loadingStats ? '...' : errorStats ? '!' : newHires?.toString() || '0'}
              trend="Last 30 days"
              color="orange"
              bgColor="bg-orange-50"
            />
          </div>

          {/* Quick Actions */}
          {/* <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">HR Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                icon={FileText}
                title="Document Management"
                description="Manage employee documents, contracts, and compliance records"
                color="blue"
                path="/admin/hr/documents"
              />
              <QuickActionCard
                icon={Smartphone}
                title="Asset Management"
                description="Track and manage company assets and equipment"
                color="green"
                path="/admin/hr/assets"
              />
              <QuickActionCard
                icon={Calendar}
                title="Leave Management"
                description="Manage employee leaves, holidays, and attendance"
                color="purple"
                path="/hr/leaves"
              />
              <QuickActionCard
                icon={TrendingUp}
                title="Performance Management"
                description="Conduct reviews, track KPIs, and manage promotions"
                color="orange"
                path="/hr/performance"
              />
              <QuickActionCard
                icon={UserPlus}
                title="Recruitment"
                description="Manage hiring, onboarding, and employee transitions"
                color="red"
                path="/hr/joining"
              />
              <QuickActionCard
                icon={Clock}
                title="HR Analytics"
                description="Track HR metrics and workforce analytics"
                color="indigo"
                path="/hr/activities"
              />
            </div>
          </div> */}

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">HR Activities</h3>
              {loadingActivities ? (
                <div className="text-gray-500">Loading...</div>
              ) : errorActivities ? (
                <div className="text-red-500">{errorActivities}</div>
              ) : activities.length === 0 ? (
                <div className="text-gray-500">No recent activities.</div>
              ) : (
                <div className="space-y-2">
                  {activities.map((activity, idx) => (
                    <RecentActivity
                      key={idx}
                      icon={activity.icon}
                      title={activity.title}
                      time={activity.time}
                      status={activity.status}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Pipeline</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">New Applications</span>
                  </div>
                  <span className="text-sm text-gray-600">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Interviews Scheduled</span>
                  </div>
                  <span className="text-sm text-gray-600">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Offers Made</span>
                  </div>
                  <span className="text-sm text-gray-600">N/A</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Joining Next Week</span>
                  </div>
                  <span className="text-sm text-gray-600">N/A</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}