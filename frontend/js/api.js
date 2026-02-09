/**
 * API Client
 * Handles all API calls to the backend
 */

const API_BASE_URL = 'http://localhost:5000/api';
const LOADING_OVERLAY_ID = 'globalLoadingOverlay';

function ensureLoadingOverlay() {
  if (typeof document === 'undefined') {
    return null;
  }

  let overlay = document.getElementById(LOADING_OVERLAY_ID);
  if (overlay) {
    return overlay;
  }

  const style = document.createElement('style');
  style.textContent = `
    #${LOADING_OVERLAY_ID} {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.35);
      backdrop-filter: blur(2px);
      z-index: 9999;
    }
    #${LOADING_OVERLAY_ID}.is-visible {
      display: flex;
    }
    #${LOADING_OVERLAY_ID} .spinner {
      width: 52px;
      height: 52px;
      border: 5px solid rgba(255, 255, 255, 0.45);
      border-top-color: #2b7de9;
      border-radius: 50%;
      animation: apiSpinner 0.9s linear infinite;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
      background: transparent;
    }
    @keyframes apiSpinner {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  overlay = document.createElement('div');
  overlay.id = LOADING_OVERLAY_ID;
  overlay.innerHTML = '<div class="spinner" aria-label="Loading"></div>';
  document.body.appendChild(overlay);

  return overlay;
}

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token');
    this.pendingRequests = 0;
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
      this.showLoading();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    this.pendingRequests += 1;
    const overlay = ensureLoadingOverlay();
    if (overlay) {
      overlay.classList.add('is-visible');
    }
  }

  hideLoading() {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);
    if (this.pendingRequests > 0) {
      return;
    }
    const overlay = ensureLoadingOverlay();
    if (overlay) {
      overlay.classList.remove('is-visible');
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

  async deleteEnquiry(enquiryId) {
    return this.request('DELETE', `/enquiries/${enquiryId}`);
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

  async deleteTicket(ticketId) {
    return this.request('DELETE', `/support/tickets/${ticketId}`);
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

  async updateContact(contactId, payload) {
    return this.request('PUT', `/contacts/${contactId}`, payload);
  }

  async deleteContact(contactId) {
    return this.request('DELETE', `/contacts/${contactId}`);
  }
}

// Create global API client instance
const apiClient = new APIClient();
