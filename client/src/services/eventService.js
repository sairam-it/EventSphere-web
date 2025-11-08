import api from './api';

export const eventService = {
  // Get all events
  getAllEvents: async () => {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch events' };
    }
  },

  // Get event by ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch event' };
    }
  },

  // Create new event (admin only)
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events/create', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create event' };
    }
  },

  // Update event (admin only)
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update event' };
    }
  },

  // Delete event (admin only)
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete event' };
    }
  },

  // Register for event
  registerForEvent: async (eventId, registrationData) => {
    try {
      const response = await api.post(`/events/${eventId}/register`, registrationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to register for event' };
    }
  },

  // Join team with code
  joinTeam: async (teamCode) => {
    try {
      const response = await api.post('/teams/join', { teamCode });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to join team' };
    }
  },

  // Get user's hosted events
  getHostedEvents: async () => {
    try {
      const response = await api.get('/events/hosted');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch hosted events' };
    }
  },

  // Get user's participated events
  getParticipatedEvents: async () => {
    try {
      const response = await api.get('/events/participated');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch participated events' };
    }
  }
};