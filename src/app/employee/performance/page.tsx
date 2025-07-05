'use client';
import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Award, Calendar, Briefcase, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APIURL } from '@/constants/api';

interface Employee {
  id: number;
  employeeId: string;
  employeeName: string;
  email: string;
  phoneNumber: string;
  bloodGroup: string;
  profilePhotoUrl: string | null;
  currentAddress: string;
  permanentAddress: string;
  password: string;
  position: string;
  department: string;
  joiningDate: number[];
  relievingDate: number[] | null;
  status: string;
}

interface PerformanceReview {
  id: number;
  employee: Employee;
  reviewStatus: string;
  rating: number;
  lastReviewDate: number[];
  nextReviewDate: number[];
  goals: string;
  feedback: string;
  achievements: string;
  reviewer: string;
}

export default function PerformancePage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

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

  // Fetch performance data when employeeId is available
  useEffect(() => {
    if (!employeeId) return; // Don't fetch if employeeId is not available
    
    setLoading(true);
    setError(null); // Clear previous errors
    const fetchReviews = async () => {
      try {
        const res = await fetch(APIURL + `/api/performance-reviews/employee/byId/1`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(data);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [employeeId]); // Added employeeId as dependency

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 py-8">Loading performance data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500 py-8">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="text-center text-gray-500 py-8">No performance data found.</div>
        </div>
      </div>
    );
  }

  // Use the first review for employee info
  const employee = reviews[0].employee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Performance Overview</h1>
            <p className="mt-2 text-gray-600">Track your career growth and achievements</p>
          </div>

          {/* Employee Info and Current Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Current Position</h2>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{employee.position}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Department: {employee.department}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Joined on {new Date(employee.joiningDate.join('-')).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Status: {employee.status}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Current Rating</h2>
                  <div className="flex items-center mt-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <p className="text-2xl font-bold text-gray-900 ml-2">{reviews[0].rating}/5</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Review Status: {reviews[0].reviewStatus}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
            <div className="flex flex-wrap gap-2">
              {reviews.map((review, idx) => (
                review.achievements && (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">{review.achievements}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals</h2>
            <div className="flex flex-wrap gap-2">
              {reviews.map((review, idx) => (
                review.goals && (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{review.goals}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Performance Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Last Review: {new Date(review.lastReviewDate.join('-')).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-600 ml-4">
                        Next Review: {new Date(review.nextReviewDate.join('-')).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">{review.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.feedback}</p>
                  <p className="text-sm text-gray-600">Reviewer: {review.reviewer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 