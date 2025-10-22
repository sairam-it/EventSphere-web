import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import LoadingSpinner from '../components/LoadingSpinner';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id);
      setEvent(response.event);
    } catch (err) {
      setError(err.message || 'Failed to fetch event details');
      // Mock data for demo
      setEvent({
        _id: id,
        title: 'Tech Innovation Summit 2024',
        description: 'Join us for the biggest tech event of the year featuring keynotes from industry leaders, networking opportunities, and hands-on workshops. This comprehensive event will cover the latest trends in artificial intelligence, blockchain technology, cloud computing, and emerging technologies that are shaping the future of business.',
        type: 'individual',
        status: 'upcoming',
        startDate: '2024-11-15T09:00:00Z',
        endDate: '2024-11-15T17:00:00Z',
        location: 'San Francisco Convention Center',
        maxParticipants: 500,
        currentParticipants: 234,
        organizer: { 
          name: 'TechCorp Events', 
          email: 'events@techcorp.com',
          bio: 'Leading technology event organizer with 10+ years of experience'
        },
        agenda: [
          { time: '09:00 AM', activity: 'Registration & Welcome Coffee' },
          { time: '10:00 AM', activity: 'Keynote: The Future of AI' },
          { time: '11:30 AM', activity: 'Panel: Blockchain Revolution' },
          { time: '01:00 PM', activity: 'Networking Lunch' },
          { time: '02:30 PM', activity: 'Workshop: Cloud Architecture' },
          { time: '04:00 PM', activity: 'Startup Pitch Session' },
          { time: '05:00 PM', activity: 'Closing Remarks' }
        ],
        requirements: [
          'Laptop required for workshops',
          'Business casual attire',
          'Valid ID for registration'
        ],
        tags: ['Technology', 'Innovation', 'Networking', 'AI', 'Blockchain']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    setRegistering(true);
    try {
      await eventService.registerForEvent(id, { userId: user.id });
      setEvent(prev => ({
        ...prev,
        currentParticipants: prev.currentParticipants + 1
      }));
      alert('Successfully registered for the event!');
    } catch (err) {
      alert(err.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner text="Loading event details..." />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md">
            {error}
          </div>
          <button
            onClick={fetchEvent}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="h-64 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
                  {event.status || 'Open'}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-white bg-opacity-20 text-white">
                  {event.type || 'Event'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center text-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                {formatDate(event.startDate)}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2 1l-3 4v7h2v7h3v-7h4z"/>
                    </svg>
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-gray-600">
                        {event.currentParticipants} / {event.maxParticipants}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agenda */}
                {event.agenda && event.agenda.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Event Agenda</h3>
                    <div className="space-y-3">
                      {event.agenda.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-20 text-sm font-medium text-gray-500 flex-shrink-0">
                            {item.time}
                          </div>
                          <div className="text-gray-700">{item.activity}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {event.requirements && event.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {event.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Registration Card */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {event.currentParticipants < event.maxParticipants ? 'Join Event' : 'Event Full'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.maxParticipants - event.currentParticipants} spots remaining
                    </div>
                  </div>

                  {event.currentParticipants < event.maxParticipants ? (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {registering ? 'Registering...' : 'Register Now'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full px-4 py-3 bg-gray-400 text-white font-medium rounded-md cursor-not-allowed"
                    >
                      Event Full
                    </button>
                  )}

                  {!isAuthenticated() && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      You need to <Link to="/login" className="text-blue-600 hover:underline">sign in</Link> to register
                    </p>
                  )}
                </div>

                {/* Organizer Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold mb-4">Organized by</h3>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                      <span className="text-lg font-medium text-gray-700">
                        {event.organizer?.name?.charAt(0)?.toUpperCase() || 'O'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.organizer?.name}</p>
                      <p className="text-sm text-gray-600">{event.organizer?.email}</p>
                      {event.organizer?.bio && (
                        <p className="text-sm text-gray-600 mt-2">{event.organizer.bio}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                {isAdmin() && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-4">Admin Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm">
                        Edit Event
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                        Delete Event
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;