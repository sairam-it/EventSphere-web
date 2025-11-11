import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import LoadingSpinner from './LoadingSpinner';

const RegistrationsModal = ({ event, isOpen, onClose }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && event) {
      fetchRegistrations();
    }
  }, [isOpen, event]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await eventService.getEventRegistrations(event._id || event.id);
      setRegistrations(response.registrations || []);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      setError(err.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Event Registrations
            </h2>
            <p className="text-sm text-gray-600 mt-1">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner text="Loading registrations..." />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
              <p className="text-gray-500">No one has registered for this event yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {registrations.map((registration, index) => (
                <div key={registration.id || index} className="border border-gray-200 rounded-lg p-4">
                  {registration.type === 'individual' ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium">
                              {registration.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{registration.name || 'Unknown'}</h3>
                            <p className="text-sm text-gray-500">Individual Registration</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(registration.registeredAt)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <p className="text-sm text-gray-900">{registration.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Phone</p>
                          <p className="text-sm text-gray-900">{registration.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2 1l-3 4v7h2v7h3v-7h4z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{registration.teamName || 'Unnamed Team'}</h3>
                            <p className="text-sm text-gray-500">Team Registration ({registration.participants?.length || 0} members)</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(registration.registeredAt)}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {registration.participants?.map((participant, pIndex) => (
                          <div key={pIndex} className="bg-gray-50 rounded-md p-3">
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                <span className="text-xs font-medium text-gray-700">
                                  {participant.name?.charAt(0)?.toUpperCase() || 'P'}
                                </span>
                              </div>
                              <p className="font-medium text-sm text-gray-900">{participant.name || 'Unknown'}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-10">
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-xs text-gray-700">{participant.email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="text-xs text-gray-700">{participant.phone || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Total: <span className="font-medium">{registrations.length}</span> registration{registrations.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationsModal;

