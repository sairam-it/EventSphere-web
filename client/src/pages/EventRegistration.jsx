import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import LoadingSpinner from '../components/LoadingSpinner';

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    registrationType: 'individual',
    teamName: '',
    teamCode: '',
    createNewTeam: false,
    additionalInfo: ''
  });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id);
      setEvent(response.event);
      
      // Set default registration type based on event type
      setFormData(prev => ({
        ...prev,
        registrationType: response.event.type === 'team' ? 'team' : 'individual'
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch event details');
      // Mock data for demo
      setEvent({
        _id: id,
        title: 'Tech Innovation Summit 2024',
        type: 'individual',
        maxParticipants: 500,
        currentParticipants: 234
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const registrationData = {
        userId: user.id,
        ...formData
      };

      await eventService.registerForEvent(id, registrationData);
      
      // Show success message and redirect
      alert('Successfully registered for the event!');
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to register for event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner text="Loading registration form..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md">
            Event not found
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Register for Event</h1>
            <p className="text-gray-600 mt-1">{event.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Registration Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Registration Type
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="individual"
                    name="registrationType"
                    type="radio"
                    value="individual"
                    checked={formData.registrationType === 'individual'}
                    onChange={handleChange}
                    disabled={event.type === 'team'}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="individual" className="ml-3 block text-sm text-gray-900">
                    Individual Registration
                    {event.type === 'team' && (
                      <span className="text-gray-500"> (Not available for team events)</span>
                    )}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="team"
                    name="registrationType"
                    type="radio"
                    value="team"
                    checked={formData.registrationType === 'team'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="team" className="ml-3 block text-sm text-gray-900">
                    Team Registration
                  </label>
                </div>
              </div>
            </div>

            {/* Team Registration Options */}
            {formData.registrationType === 'team' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Team Options</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="joinExisting"
                      name="createNewTeam"
                      type="radio"
                      value={false}
                      checked={!formData.createNewTeam}
                      onChange={() => setFormData(prev => ({ ...prev, createNewTeam: false }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="joinExisting" className="ml-3 block text-sm text-gray-900">
                      Join existing team with code
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="createNew"
                      name="createNewTeam"
                      type="radio"
                      value={true}
                      checked={formData.createNewTeam}
                      onChange={() => setFormData(prev => ({ ...prev, createNewTeam: true }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="createNew" className="ml-3 block text-sm text-gray-900">
                      Create new team
                    </label>
                  </div>
                </div>

                {!formData.createNewTeam ? (
                  <div>
                    <label htmlFor="teamCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Team Code *
                    </label>
                    <input
                      type="text"
                      id="teamCode"
                      name="teamCode"
                      required={formData.registrationType === 'team' && !formData.createNewTeam}
                      value={formData.teamCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter team code provided by team leader"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      id="teamName"
                      name="teamName"
                      required={formData.registrationType === 'team' && formData.createNewTeam}
                      value={formData.teamName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your team name"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You'll receive a team code to share with other members
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Additional Information */}
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows={3}
                value={formData.additionalInfo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional information or special requirements..."
              />
            </div>

            {/* Event Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Registration Summary</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Event:</strong> {event.title}</p>
                <p><strong>Type:</strong> {formData.registrationType} registration</p>
                {formData.registrationType === 'team' && formData.createNewTeam && (
                  <p><strong>Team:</strong> {formData.teamName || 'New team'}</p>
                )}
                {formData.registrationType === 'team' && !formData.createNewTeam && formData.teamCode && (
                  <p><strong>Joining team with code:</strong> {formData.teamCode}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
              />
              <label htmlFor="agreeTerms" className="ml-3 block text-sm text-gray-900">
                I agree to the event terms and conditions and understand that registration is binding
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/events/${id}`)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;