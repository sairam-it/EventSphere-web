import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('participated');
  const [hostedEvents, setHostedEvents] = useState([]);
  const [participatedEvents, setParticipatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch both hosted and participated events
      const [hostedResponse, participatedResponse] = await Promise.allSettled([
        eventService.getHostedEvents(),
        eventService.getParticipatedEvents()
      ]);

      if (hostedResponse.status === 'fulfilled') {
        setHostedEvents(hostedResponse.value.events || []);
      } else {
        // Mock data for hosted events
        setHostedEvents([
          {
            _id: 'hosted-1',
            title: 'My Tech Meetup',
            description: 'A monthly meetup for tech enthusiasts in the area.',
            type: 'individual',
            status: 'upcoming',
            startDate: '2024-11-20T18:00:00Z',
            location: 'Community Center',
            maxParticipants: 50,
            currentParticipants: 23,
            organizer: { name: user?.name, email: user?.email }
          }
        ]);
      }

      if (participatedResponse.status === 'fulfilled') {
        setParticipatedEvents(participatedResponse.value.events || []);
      } else {
        // Mock data for participated events
        setParticipatedEvents([
          {
            _id: 'participated-1',
            title: 'React Workshop',
            description: 'Learn React from the ground up with hands-on exercises.',
            type: 'individual',
            status: 'completed',
            startDate: '2024-10-15T14:00:00Z',
            location: 'Online',
            maxParticipants: 100,
            currentParticipants: 87,
            organizer: { name: 'React Academy', email: 'info@reactacademy.com' }
          },
          {
            _id: 'participated-2',
            title: 'Hackathon 2024',
            description: 'Build innovative solutions in 48 hours with your team.',
            type: 'team',
            status: 'completed',
            startDate: '2024-09-28T09:00:00Z',
            location: 'Tech Hub',
            maxParticipants: 200,
            currentParticipants: 156,
            organizer: { name: 'Innovation Labs', email: 'hackathon@innovationlabs.com' }
          }
        ]);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'participated', label: 'Participated Events', count: participatedEvents.length },
    { id: 'hosted', label: 'Hosted Events', count: hostedEvents.length }
  ];

  const currentEvents = activeTab === 'hosted' ? hostedEvents : participatedEvents;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your events and track your participation
              </p>
            </div>
            {isAdmin() && (
              <div className="mt-4 md:mt-0">
                <Link
                  to="/create-event"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participated</p>
                <p className="text-2xl font-bold text-gray-900">{participatedEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Events Hosted</p>
                <p className="text-2xl font-bold text-gray-900">{hostedEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Account Type</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {user?.role || 'User'}
                  {isAdmin() && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Admin
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
                <button
                  onClick={fetchDashboardData}
                  className="ml-4 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            {currentEvents.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} events yet
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'hosted' 
                    ? 'Start organizing events to build your community'
                    : 'Join events to connect with like-minded people'
                  }
                </p>
                {activeTab === 'hosted' && isAdmin() ? (
                  <Link
                    to="/create-event"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Event
                  </Link>
                ) : (
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Browse Events
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.map(event => (
                  <EventCard key={event._id || event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;