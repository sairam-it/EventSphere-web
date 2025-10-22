import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents();
      setEvents(response.events || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
      // For demo purposes, use mock data if API fails
      setEvents([
        {
          _id: '1',
          title: 'Tech Innovation Summit 2024',
          description: 'Join us for the biggest tech event of the year featuring keynotes from industry leaders, networking opportunities, and hands-on workshops.',
          type: 'individual',
          status: 'upcoming',
          startDate: '2024-11-15T09:00:00Z',
          location: 'San Francisco Convention Center',
          maxParticipants: 500,
          currentParticipants: 234,
          organizer: { name: 'TechCorp Events', email: 'events@techcorp.com' }
        },
        {
          _id: '2',
          title: 'Startup Pitch Competition',
          description: 'Compete with innovative startups for a chance to win $50,000 in funding. Teams of 3-5 members required.',
          type: 'team',
          status: 'upcoming',
          startDate: '2024-11-22T14:00:00Z',
          location: 'Innovation Hub Downtown',
          maxParticipants: 100,
          currentParticipants: 67,
          organizer: { name: 'Startup Accelerator', email: 'info@startupaccel.com' }
        },
        {
          _id: '3',
          title: 'AI/ML Workshop Series',
          description: 'Learn the fundamentals of artificial intelligence and machine learning through hands-on projects and expert guidance.',
          type: 'individual',
          status: 'ongoing',
          startDate: '2024-10-20T10:00:00Z',
          location: 'Virtual Event',
          maxParticipants: 200,
          currentParticipants: 156,
          organizer: { name: 'AI Learning Institute', email: 'workshops@ailearn.org' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner text="Loading events..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect, learn, and grow with events that matter to you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="#events"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="events">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Events</option>
              <option value="individual">Individual</option>
              <option value="team">Team</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {error && !events.length ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md inline-block">
              {error}
            </div>
            <button
              onClick={fetchEvents}
              className="mt-4 block mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Be the first to create an event!'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filterType === 'all' ? 'All Events' : `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Events`}
              </h2>
              <p className="text-gray-600">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event._id || event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to create your own event?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of organizers who trust EventSphere to bring their communities together
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Organizing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;