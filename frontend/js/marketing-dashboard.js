/**
 * Marketing Dashboard Script
 * Handles marketing panel functionality for enquiry management
 */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initDashboard();
});

async function initDashboard() {
  const user = getCurrentUser();
  updateUserDisplay(user);
  setupEventListeners();
  loadDashboardData();
}

/**
 * Update user display information in sidebar
 */
function updateUserDisplay(user) {
  if (user) {
    const userInfo = document.getElementById('userInfo');
    const userDisplay = document.getElementById('userDisplay');
    userInfo.innerHTML = `<p><strong>${user.name}</strong><br><small>${user.role}</small></p>`;
    userDisplay.textContent = user.name;
  }
}

/**
 * Setup event listeners for UI interactions
 */
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

/**
 * Load dashboard statistics and initial data
 */
async function loadDashboardData() {
  try {
    // Load dashboard stats (total, new, replied enquiries)
    await loadDashboardStats();
    
    // Load enquiries table for the enquiries tab
    await loadEnquiriesTable();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

/**
 * Fetch and display dashboard statistics cards
 */
async function loadDashboardStats() {
  try {
    const response = await fetch('http://localhost:5000/api/marketing/dashboard-stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    const data = await response.json();
    const stats = data.data;

    // Update stat cards
    if (document.getElementById('totalEnquiries')) {
      document.getElementById('totalEnquiries').textContent = stats.totalEnquiries;
    }
    if (document.getElementById('newEnquiries')) {
      document.getElementById('newEnquiries').textContent = stats.newEnquiries;
    }
    if (document.getElementById('repliedEnquiries')) {
      document.getElementById('repliedEnquiries').textContent = stats.repliedEnquiries;
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

/**
 * Fetch and display enquiries table
 */
async function loadEnquiriesTable() {
  try {
    const response = await fetch('http://localhost:5000/api/marketing/enquiries', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch enquiries');
    }

    const data = await response.json();
    const enquiries = data.data || [];

    renderEnquiriesTable(enquiries);
  } catch (error) {
    console.error('Error loading enquiries table:', error);
    document.getElementById('enquiriesTableBody').innerHTML = 
      '<tr><td colspan="7" class="text-center text-danger">Error loading enquiries</td></tr>';
  }
}

/**
 * Render enquiries table with data
 */
function renderEnquiriesTable(enquiries) {
  const tbody = document.getElementById('enquiriesTableBody');
  
  if (!tbody) {
    console.warn('enquiriesTableBody element not found');
    return;
  }

  if (enquiries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No enquiries found</td></tr>';
    return;
  }

  tbody.innerHTML = enquiries.map(enquiry => `
    <tr>
      <td>${escapeHtml(enquiry.company_name || 'N/A')}</td>
      <td>${escapeHtml(enquiry.contact_name || 'N/A')}</td>
      <td>${escapeHtml(enquiry.email || 'N/A')}</td>
      <td><span class="badge badge-${enquiry.customer_type}">${enquiry.customer_type}</span></td>
      <td>${escapeHtml(enquiry.subject || 'N/A')}</td>
      <td><span class="status-badge status-${enquiry.status}">${enquiry.status}</span></td>
      <td>${formatDate(enquiry.created_at)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewEnquiryDetails('${enquiry.id}')">View</button>
      </td>
    </tr>
  `).join('');
}

/**
 * Switch between dashboard and enquiries tabs
 */
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Deactivate all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Show selected tab
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Activate nav link
  const navLink = document.querySelector(`[data-tab="${tabName}"]`);
  if (navLink) {
    navLink.classList.add('active');
  }

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    enquiries: 'Enquiries',
  };
  document.getElementById('pageTitle').textContent = titles[tabName] || 'Dashboard';

  // Reload data if switching to enquiries tab
  if (tabName === 'enquiries') {
    loadEnquiriesTable();
  }
}

/**
 * View details of a single enquiry
 * Shows original message, AI reply, and reply editing UI
 */
async function viewEnquiryDetails(enquiryId) {
  try {
    const response = await fetch(`http://localhost:5000/api/marketing/enquiries/${enquiryId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch enquiry details');
    }

    const data = await response.json();
    const enquiry = data.data;

    // Build detail view HTML
    const detailHTML = `
      <div class="enquiry-detail-header">
        <button class="btn btn-secondary btn-sm" onclick="backToEnquiries()">← Back</button>
        <h2>${escapeHtml(enquiry.subject)}</h2>
      </div>

      <div class="enquiry-detail-grid">
        <div class="detail-card">
          <h4>Contact Information</h4>
          <div class="detail-row">
            <label>Name:</label>
            <p>${escapeHtml(enquiry.contact_name)}</p>
          </div>
          <div class="detail-row">
            <label>Email:</label>
            <p>${escapeHtml(enquiry.email)}</p>
          </div>
          <div class="detail-row">
            <label>Company:</label>
            <p>${escapeHtml(enquiry.company_name)}</p>
          </div>
          <div class="detail-row">
            <label>Customer Type:</label>
            <p><span class="badge badge-${enquiry.contact_customer_type}">${enquiry.contact_customer_type}</span></p>
          </div>
          <div class="detail-row">
            <label>Status:</label>
            <p><span class="status-badge status-${enquiry.status}">${enquiry.status}</span></p>
          </div>
        </div>

        <div class="detail-card">
          <h4>Original Message</h4>
          <div class="message-box">
            ${escapeHtml(enquiry.message)}
          </div>
        </div>

        <div class="detail-card">
          <h4>AI-Generated Reply (Editable)</h4>
          <textarea 
            id="replyTextarea" 
            class="form-control" 
            rows="8"
            placeholder="Enter your reply..."
          >${enquiry.ai_reply || ''}</textarea>
        </div>

        <div class="detail-card action-buttons">
          <button class="btn btn-success" onclick="sendEnquiryReply('${enquiry.id}')">Send Reply</button>
          ${enquiry.status === 'replied' ? 
            `<button class="btn btn-warning" onclick="closeEnquiry('${enquiry.id}')">Close Enquiry</button>` 
            : ''}
          <button class="btn btn-secondary" onclick="backToEnquiries()">Cancel</button>
        </div>
      </div>
    `;

    // Display in modal or detail view
    const detailContainer = document.getElementById('enquiryDetailContainer');
    if (detailContainer) {
      detailContainer.innerHTML = detailHTML;
      detailContainer.style.display = 'block';
      
      // Hide enquiries list
      const listContainer = document.getElementById('enquiriesTableContainer');
      if (listContainer) listContainer.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading enquiry details:', error);
    alert('Failed to load enquiry details: ' + error.message);
  }
}

/**
 * Send reply to enquiry
 * Updates enquiry status to 'replied' and upgrades customer type
 */
async function sendEnquiryReply(enquiryId) {
  const reply = document.getElementById('replyTextarea').value;
  
  if (!reply || !reply.trim()) {
    alert('Please enter a reply before sending');
    return;
  }

  try {
    const data = await apiClient.replyEnquiry(enquiryId, reply.trim());
    
    if (data.success) {
      alert('Reply sent successfully!');
      backToEnquiries();
      loadDashboardData();
    }
  } catch (error) {
    console.error('Error sending reply:', error);
    alert('Failed to send reply: ' + error.message);
  }
}

/**
 * Close an enquiry (mark as closed)
 * Only available when status is 'replied'
 */
async function closeEnquiry(enquiryId) {
  if (!confirm('Are you sure you want to close this enquiry?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/marketing/enquiries/${enquiryId}/close`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to close enquiry');
    }

    const data = await response.json();
    
    if (data.success) {
      alert('Enquiry closed successfully!');
      backToEnquiries();
      loadDashboardData();
    }
  } catch (error) {
    console.error('Error closing enquiry:', error);
    alert('Failed to close enquiry: ' + error.message);
  }
}

/**
 * Go back from enquiry detail to enquiries list
 */
function backToEnquiries() {
  const listContainer = document.getElementById('enquiriesTableContainer');
  const detailContainer = document.getElementById('enquiryDetailContainer');
  
  if (listContainer) listContainer.style.display = 'block';
  if (detailContainer) detailContainer.style.display = 'none';
  
  loadEnquiriesTable();
}

/**
 * Utility: Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Utility: Format date to readable format
 */
function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}
