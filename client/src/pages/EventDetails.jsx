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
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  // Individual registration form data
  const [individualForm, setIndividualForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Team registration form data
  const [teamForm, setTeamForm] = useState({
    numberOfParticipants: 2,
    participants: [
      { name: '', email: '', phone: '' },
      { name: '', email: '', phone: '' }
    ]
  });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id);
      setEvent(response.event);
    } catch (err) {
      console.error('Failed to fetch event:', err);
      setError(err.message || 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (!isAuthenticated()) {
      // Show alert and redirect to login
      alert('Please log in to register for this event.');
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setShowRegistrationModal(true);
    // Pre-fill individual form with user data if available
    if (user) {
      setIndividualForm({
        name: user.name || '',
        email: user.email || '',
        phone: ''
      });
    }
  };

  const handleIndividualRegister = async (e) => {
    e.preventDefault();
    if (!individualForm.name || !individualForm.email || !individualForm.phone) {
      setError('Please fill in all fields');
      return;
    }

    setRegistering(true);
    setError('');
    try {
      await eventService.registerForEvent(id, {
        type: 'individual',
        name: individualForm.name,
        email: individualForm.email,
        phone: individualForm.phone
      });
      
      setEvent(prev => ({
        ...prev,
        currentParticipants: (prev.currentParticipants || prev.participantsCount || 0) + 1
      }));
      setShowRegistrationModal(false);
      setIndividualForm({ name: '', email: '', phone: '' });
      alert('Successfully registered for the event!');
      // Refresh event data
      fetchEvent();
    } catch (err) {
      setError(err.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleTeamRegister = async (e) => {
    e.preventDefault();
    
    // Validate all participants have required fields
    const isValid = teamForm.participants.every(p => p.name && p.email && p.phone);
    if (!isValid) {
      setError('Please fill in all participant details');
      return;
    }

    if (teamForm.numberOfParticipants > (event?.maxTeamSize || 5)) {
      setError(`Team size cannot exceed ${event?.maxTeamSize || 5} members`);
      return;
    }

    setRegistering(true);
    setError('');
    try {
      await eventService.registerForEvent(id, {
        type: 'team',
        numberOfParticipants: teamForm.numberOfParticipants,
        participants: teamForm.participants.slice(0, teamForm.numberOfParticipants)
      });
      
      setEvent(prev => ({
        ...prev,
        currentParticipants: (prev.currentParticipants || prev.participantsCount || 0) + teamForm.numberOfParticipants
      }));
      setShowRegistrationModal(false);
      setTeamForm({
        numberOfParticipants: 2,
        participants: [
          { name: '', email: '', phone: '' },
          { name: '', email: '', phone: '' }
        ]
      });
      alert('Successfully registered team for the event!');
      // Refresh event data
      fetchEvent();
    } catch (err) {
      setError(err.message || 'Failed to register team for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleParticipantCountChange = (count) => {
    const numCount = parseInt(count);
    if (numCount < 2 || numCount > (event?.maxTeamSize || 10)) return;
    
    setTeamForm(prev => {
      const newParticipants = [...prev.participants];
      // Add or remove participants as needed
      while (newParticipants.length < numCount) {
        newParticipants.push({ name: '', email: '', phone: '' });
      }
      while (newParticipants.length > numCount) {
        newParticipants.pop();
      }
      return {
        ...prev,
        numberOfParticipants: numCount,
        participants: newParticipants
      };
    });
  };

  const handleParticipantChange = (index, field, value) => {
    setTeamForm(prev => ({
      ...prev,
      participants: prev.participants.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
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
                        {(event.currentParticipants || event.participantsCount || 0)} / {(event.maxParticipants || 0)}
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
                      {(() => {
                        const current = event.currentParticipants || event.participantsCount || 0;
                        const max = event.maxParticipants || 0;
                        // Only show "Event Full" if maxParticipants > 0 AND current >= max
                        if (max > 0 && current >= max) {
                          return 'Event Full';
                        }
                        return 'Join Event';
                      })()}
                    </div>
                    {(() => {
                      const current = event.currentParticipants || event.participantsCount || 0;
                      const max = event.maxParticipants || 0;
                      const remaining = max > 0 ? max - current : 0;
                      return (
                        <div className="text-sm text-gray-600">
                          {max > 0 ? `${remaining} spots remaining` : 'Unlimited spots'}
                        </div>
                      );
                    })()}
                  </div>

                  {(() => {
                    const current = event.currentParticipants || event.participantsCount || 0;
                    const max = event.maxParticipants || 0;
                    // Only disable if maxParticipants > 0 AND current >= max
                    const isFull = max > 0 && current >= max;
                    return !isFull;
                  })() ? (
                    <button
                      onClick={handleRegisterClick}
                      disabled={registering}
                      className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Register Now
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

        {/* Registration Modal */}
        {showRegistrationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Register for {event.title}
                  </h2>
                  <button
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setError('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Individual Event Registration */}
                {(!event.isTeamEvent && event.type !== 'team') ? (
                  <form onSubmit={handleIndividualRegister} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={individualForm.name}
                        onChange={(e) => setIndividualForm({ ...individualForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={individualForm.email}
                        onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={individualForm.phone}
                        onChange={(e) => setIndividualForm({ ...individualForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRegistrationModal(false);
                          setError('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={registering}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {registering ? 'Registering...' : 'Register'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Team Event Registration */
                  <form onSubmit={handleTeamRegister} className="space-y-4">
                    <div>
                      <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Participants (Max: {event?.maxTeamSize || 5}) *
                      </label>
                      <input
                        type="number"
                        id="teamSize"
                        required
                        min="2"
                        max={event?.maxTeamSize || 5}
                        value={teamForm.numberOfParticipants}
                        onChange={(e) => handleParticipantCountChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {teamForm.participants.slice(0, teamForm.numberOfParticipants).map((participant, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-3">Participant {index + 1}</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={participant.name}
                                onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter participant name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                              </label>
                              <input
                                type="email"
                                required
                                value={participant.email}
                                onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter participant email"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                required
                                value={participant.phone}
                                onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter participant phone"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRegistrationModal(false);
                          setError('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={registering}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {registering ? 'Registering...' : 'Register Team'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;