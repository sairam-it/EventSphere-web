import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, manageActions = false, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'team':
        return 'bg-blue-100 text-blue-800';
      case 'individual':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Event Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <p className="text-sm opacity-75">Event Image</p>
            </div>
          </div>
        )}
        
        {/* Event Type Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.type)}`}>
            {event.type || 'Event'}
          </span>
        </div>

        {/* Event Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
            {event.status || 'Open'}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title || 'Untitled Event'}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description || 'No description available'}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            {event.startDate ? formatDate(event.startDate) : 'Date TBD'}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {event.location || 'Location TBD'}
          </div>

          {(event.maxParticipants > 0) && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2 1l-3 4v7h2v7h3v-7h4z"/>
              </svg>
              {(event.currentParticipants || event.participantsCount || 0)} / {event.maxParticipants} participants
            </div>
          )}
        </div>

        {/* Organizer */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-gray-700">
              {event.organizer?.name?.charAt(0)?.toUpperCase() || 'O'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {event.organizer?.name || 'Unknown Organizer'}
            </p>
            <p className="text-xs text-gray-500">Organizer</p>
          </div>
        </div>

        {/* Actions */}
        {manageActions ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onEdit && onEdit(event)}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700 transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete && onDelete(event)}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <Link
            to={`/events/${event._id || event.id}`}
            className="block w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default EventCard;