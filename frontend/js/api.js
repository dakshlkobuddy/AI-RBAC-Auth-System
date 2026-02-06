/**
 * API Client
 * Handles all API calls to the backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Set token after login
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove token on logout
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Make API request
  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (this.token) {
      options.headers.Authorization = `Bearer ${this.token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth APIs
  async login(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  }

  async setPassword(userId, password) {
    return this.request('POST', `/auth/set-password/${userId}`, { password });
  }

  async setPasswordWithToken(token, password) {
    return this.request('POST', '/auth/set-password', { token, password });
  }

  // User APIs
  async createUser(name, email, role) {
    return this.request('POST', '/users', { name, email, role });
  }

  async getUsers() {
    return this.request('GET', '/users');
  }

  async getUser(userId) {
    return this.request('GET', `/users/${userId}`);
  }

  async updateUser(userId, name, email, role) {
    return this.request('PUT', `/users/${userId}`, { name, email, role });
  }

  async deleteUser(userId) {
    return this.request('DELETE', `/users/${userId}`);
  }

  // Enquiry APIs
  async getEnquiries() {
    return this.request('GET', '/enquiries');
  }

  async getEnquiry(enquiryId) {
    return this.request('GET', `/enquiries/${enquiryId}`);
  }

  async replyEnquiry(enquiryId, reply) {
    return this.request('POST', `/enquiries/${enquiryId}/reply`, { reply });
  }

  // Support Ticket APIs
  async getTickets() {
    return this.request('GET', '/support/tickets');
  }

  async getTicket(ticketId) {
    return this.request('GET', `/support/tickets/${ticketId}`);
  }

  async replyTicket(ticketId, reply) {
    return this.request('POST', `/support/tickets/${ticketId}/reply`, { reply });
  }

  async resolveTicket(ticketId) {
    return this.request('POST', `/support/tickets/${ticketId}/resolve`);
  }

  // Email APIs
  async receiveEmail(senderEmail, senderName, subject, message) {
    return this.request('POST', '/emails/receive', {
      fromEmail: senderEmail,
      fromName: senderName,
      subject,
      message,
    });
  }

  // Contact APIs
  async getContacts() {
    return this.request('GET', '/contacts');
  }

  async getContact(contactId) {
    return this.request('GET', `/contacts/${contactId}`);
  }
}

// Create global API client instance
const apiClient = new APIClient();
