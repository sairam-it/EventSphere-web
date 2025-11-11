import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RegistrationsModal from '../components/RegistrationsModal';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('participated');
  const [hostedEvents, setHostedEvents] = useState([]);
  const [participatedEvents, setParticipatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);

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
        setHostedEvents(hostedResponse.value.events || hostedResponse.value.hostedEvents || []);
      } else {
        console.error('Failed to fetch hosted events:', hostedResponse.reason);
        setHostedEvents([]);
      }

      if (participatedResponse.status === 'fulfilled') {
        setParticipatedEvents(participatedResponse.value.events || participatedResponse.value.participatedEvents || []);
      } else {
        console.error('Failed to fetch participated events:', participatedResponse.reason);
        setParticipatedEvents([]);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
      setHostedEvents([]);
      setParticipatedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await eventService.deleteEvent(event._id || event.id);
      setHostedEvents(prev => prev.filter(e => (e._id || e.id) !== (event._id || event.id)));
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const handleEditEvent = (event) => {
    navigate(`/events/${event._id || event.id}/edit`);
  };

  const handleViewRegistrations = (event) => {
    setSelectedEvent(event);
    setShowRegistrationsModal(true);
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                {activeTab === 'hosted' ? (
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
                  <EventCard
                    key={event._id || event.id}
                    event={event}
                    manageActions={activeTab === 'hosted'}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onViewRegistrations={handleViewRegistrations}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registrations Modal */}
      {selectedEvent && (
        <RegistrationsModal
          event={selectedEvent}
          isOpen={showRegistrationsModal}
          onClose={() => {
            setShowRegistrationsModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;