import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'individual',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
    maxTeamSize: '',
    noOfGirls: '',
    noOfBoys: '',
    requirements: '',
    tags: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Process form data
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.startDate, // Backend expects 'date' field
        location: formData.location,
        category: formData.category || 'other',
        maxParticipants: parseInt(formData.maxParticipants) || 0,
        isTeamEvent: formData.type === 'team',
        ...(formData.type === 'team' && {
          maxTeamSize: parseInt(formData.maxTeamSize) || 5,
          noOfGirls: parseInt(formData.noOfGirls) || 0,
          noOfBoys: parseInt(formData.noOfBoys) || 0,
        }),
        ...(formData.requirements && {
          requirements: formData.requirements.split('\n').filter(req => req.trim())
        }),
        ...(formData.tags && {
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      };

      const response = await eventService.createEvent(eventData);
      // Navigate to dashboard after successful creation
      // Dashboard will automatically refresh and show the new event
      navigate('/dashboard');
    } catch (err) {
      console.error('Create event error:', err);
      setError(err.message || 'Failed to create event. Please check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner text="Creating your event..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-600 mt-1">Fill in the details to create your event</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your event..."
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="individual">Individual Event</option>
                  <option value="team">Team Event</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Individual events allow single registrations, team events require team participation
                </p>
              </div>

              {/* Team Event Specific Fields */}
              {formData.type === 'team' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-900">Team Event Settings</h3>
                  
                  <div>
                    <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Team Size *
                    </label>
                    <input
                      type="number"
                      id="maxTeamSize"
                      name="maxTeamSize"
                      required={formData.type === 'team'}
                      min="2"
                      value={formData.maxTeamSize}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter maximum team size"
                    />
                  </div>

                  <div>
                    <label htmlFor="noOfGirls" className="block text-sm font-medium text-gray-700 mb-1">
                      No. of Girls *
                    </label>
                    <input
                      type="number"
                      id="noOfGirls"
                      name="noOfGirls"
                      required={formData.type === 'team'}
                      min="0"
                      value={formData.noOfGirls}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter number of girls required"
                    />
                  </div>

                  <div>
                    <label htmlFor="noOfBoys" className="block text-sm font-medium text-gray-700 mb-1">
                      No. of Boys *
                    </label>
                    <input
                      type="number"
                      id="noOfBoys"
                      name="noOfBoys"
                      required={formData.type === 'team'}
                      min="0"
                      value={formData.noOfBoys}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter number of boys required"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Date and Location */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Date & Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Event location or 'Virtual Event'"
                />
              </div>
            </div>

            {/* Participants and Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
              
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Participants *
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  required
                  min="1"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter maximum number of participants"
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter each requirement on a new line"
                />
                <p className="text-xs text-gray-500 mt-1">
                  List any requirements for participants (one per line)
                </p>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add tags to help people find your event (e.g., Technology, Networking, Workshop)
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;