/**
 * Admin Dashboard Script
 * Handles admin panel functionality
 */

let editingUserId = null;
let cachedUsers = [];
let editingContactId = null;

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

function updateUserDisplay(user) {
  if (user) {
    const userInfo = document.getElementById('userInfo');
    const userDisplay = document.getElementById('userDisplay');
    userInfo.innerHTML = `<p><strong>${user.name}</strong><br><small>${user.role}</small></p>`;
    userDisplay.textContent = user.name;
  }
}

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Create user button
  document.getElementById('createUserBtn').addEventListener('click', () => {
    toggleUserForm();
  });

  // User form submission
  document.getElementById('userFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitUserForm();
  });

  const contactEditForm = document.getElementById('contactEditForm');
  if (contactEditForm) {
    contactEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitContactEditForm();
    });
  }

  const contactEditCloseBtn = document.getElementById('contactEditCloseBtn');
  if (contactEditCloseBtn) {
    contactEditCloseBtn.addEventListener('click', closeContactEditModal);
  }
  const contactEditCancelBtn = document.getElementById('contactEditCancelBtn');
  if (contactEditCancelBtn) {
    contactEditCancelBtn.addEventListener('click', closeContactEditModal);
  }
}

function showModal(message, options = {}) {
  const modal = document.getElementById('appModal');
  if (!modal) {
    console.error('Modal container not found');
    return Promise.resolve(false);
  }

  const {
    title = 'Message',
    confirmText,
    cancelText = 'No',
    showCancel = true,
  } = options;

  const titleEl = document.getElementById('appModalTitle');
  const messageEl = document.getElementById('appModalMessage');
  const yesBtn = document.getElementById('appModalYes');
  const noBtn = document.getElementById('appModalNo');
  const closeBtn = document.getElementById('appModalClose');
  const resolvedConfirmText = confirmText || (showCancel ? 'Yes' : 'OK');

  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;
  if (yesBtn) yesBtn.textContent = resolvedConfirmText;
  if (noBtn) noBtn.textContent = cancelText;
  if (noBtn) noBtn.style.display = showCancel ? 'inline-flex' : 'none';

  modal.style.display = 'flex';

  return new Promise(resolve => {
    const cleanup = () => {
      modal.style.display = 'none';
      if (yesBtn) yesBtn.removeEventListener('click', onYes);
      if (noBtn) noBtn.removeEventListener('click', onNo);
      if (closeBtn) closeBtn.removeEventListener('click', onNo);
      modal.removeEventListener('click', onBackdrop);
    };

    const onYes = () => {
      cleanup();
      resolve(true);
    };
    const onNo = () => {
      cleanup();
      resolve(false);
    };
    const onBackdrop = (event) => {
      if (event.target === modal) {
        onNo();
      }
    };

    if (yesBtn) yesBtn.addEventListener('click', onYes);
    if (noBtn) noBtn.addEventListener('click', onNo);
    if (closeBtn) closeBtn.addEventListener('click', onNo);
    modal.addEventListener('click', onBackdrop);
  });
}

async function loadDashboardData() {
  try {
    // Load stats
    const users = await apiClient.getUsers();
    const enquiries = await apiClient.getEnquiries();
    const tickets = await apiClient.getTickets();
    const contacts = await apiClient.getContacts();

    const visibleUsers = (users.users || []).filter(user => user.role_name !== 'admin' && user.has_password);

    // Update dashboard stats
    if (document.getElementById('totalUsers')) {
      document.getElementById('totalUsers').textContent = visibleUsers.length;
      document.getElementById('totalEnquiries').textContent = enquiries.enquiries?.length || 0;
      document.getElementById('totalTickets').textContent = tickets.tickets?.length || 0;
      document.getElementById('totalContacts').textContent = contacts.contacts?.length || 0;
    }

    // Load users table
    cachedUsers = users.users || [];
    loadUsers(cachedUsers);

    // Load enquiries table
    loadEnquiries(enquiries.enquiries || []);

    // Load tickets table
    loadTickets(tickets.tickets || []);

    // Load contacts table
    loadContacts(contacts.contacts || []);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

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
    users: 'User Management',
    enquiries: 'Enquiries',
    support: 'Support Tickets',
    contacts: 'Contacts',
  };
  document.getElementById('pageTitle').textContent = titles[tabName] || 'Dashboard';
}

function toggleUserForm() {
  const form = document.getElementById('createUserForm');
  const isHidden = form.style.display === 'none';
  form.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    resetUserForm();
  }
}

function resetUserForm() {
  editingUserId = null;
  const formEl = document.getElementById('userFormElement');
  formEl.reset();
  document.getElementById('userFormTitle').textContent = 'Create New User';
  document.getElementById('userFormSubmitBtn').textContent = 'Create User';
}

async function submitUserForm() {
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const role = document.getElementById('userRole').value;

  try {
    if (!name.trim()) {
      await showModal('Name is required', { title: 'Validation', showCancel: false });
      return;
    }
    if (!isValidEmail(email)) {
      await showModal('Please enter a valid email address', { title: 'Validation', showCancel: false });
      return;
    }
    if (!role) {
      await showModal('Please select a role', { title: 'Validation', showCancel: false });
      return;
    }

    if (editingUserId) {
      await apiClient.updateUser(editingUserId, name, email, role);
      await showModal('User updated successfully!', { title: 'Success', showCancel: false });
    } else {
      await apiClient.createUser(name, email, role);
      await showModal('User created successfully! Password setup email sent.', { title: 'Success', showCancel: false });
    }
    toggleUserForm();
    loadDashboardData();
  } catch (error) {
    await showModal(`Error saving user: ${error.message}`, { title: 'Error', showCancel: false });
  }
}

function loadUsers(users) {
  const tbody = document.querySelector('#usersTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  users
    .filter(user => user.role_name !== 'admin' && user.has_password)
    .forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="badge badge-${user.role_name}">${user.role_name}</span></td>
      <td><span class="status-badge ${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
      <td>${new Date(user.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editUser('${user.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUserConfirm('${user.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function deleteUserConfirm(userId) {
  const confirmed = await showModal('Are you sure you want to delete this user?', { title: 'Confirm', showCancel: true });
  if (!confirmed) {
    return;
  }

  try {
    await apiClient.deleteUser(userId);
    await showModal('User deleted successfully', { title: 'Success', showCancel: false });
    loadDashboardData();
  } catch (error) {
    await showModal(`Error deleting user: ${error.message}`, { title: 'Error', showCancel: false });
  }
}

async function editUser(userId) {
  const user = cachedUsers.find(u => u.id === userId);
  if (!user) {
    await showModal('User not found', { title: 'Error', showCancel: false });
    return;
  }

  editingUserId = userId;
  document.getElementById('userName').value = user.name || '';
  document.getElementById('userEmail').value = user.email || '';
  document.getElementById('userRole').value = user.role_name || '';
  document.getElementById('userFormTitle').textContent = 'Edit User';
  document.getElementById('userFormSubmitBtn').textContent = 'Update User';

  const form = document.getElementById('createUserForm');
  form.style.display = 'block';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').toLowerCase());
}

function isValidPhone(value) {
  if (!value) return true;
  return /^[0-9]{7,15}$/.test(String(value).trim());
}

async function loadEnquiries(enquiries) {
  const tbody = document.getElementById('enquiriesTable');
  if (!tbody) return;

  tbody.innerHTML = '';
  const emptyEl = document.getElementById('enquiriesEmpty');
  if (enquiries.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  enquiries.forEach(enquiry => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${enquiry.subject}</td>
      <td>${enquiry.contact_name}</td>
      <td>${enquiry.company_name || 'N/A'}</td>
      <td><span class="badge badge-${enquiry.customer_type}">${enquiry.customer_type}</span></td>
      <td><span class="status-badge ${enquiry.status}">${enquiry.status}</span></td>
      <td>${new Date(enquiry.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewEnquiry('${enquiry.id}')">View</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEnquiryConfirm('${enquiry.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function viewEnquiry(enquiryId) {
  try {
    const response = await apiClient.getEnquiry(enquiryId);
    const enquiry = response.enquiry;

    const detailContent = document.getElementById('enquiryDetailContent');
    detailContent.innerHTML = `
      <h3>${enquiry.subject}</h3>
      <div class="detail-row">
        <div class="detail-item">
          <label>Contact:</label>
          <p>${enquiry.contact_name} (${enquiry.contact_email})</p>
        </div>
        <div class="detail-item">
          <label>Company:</label>
          <p>${enquiry.company_name || 'N/A'}</p>
        </div>
        <div class="detail-item">
          <label>Customer Type:</label>
          <p>${enquiry.customer_type}</p>
        </div>
        <div class="detail-item">
          <label>Status:</label>
          <p><span class="status-badge ${enquiry.status}">${enquiry.status}</span></p>
        </div>
      </div>
      <div class="detail-item">
        <label>Original Message:</label>
        <p>${enquiry.message}</p>
      </div>
      <div class="detail-item">
        <label>AI-Generated Reply:</label>
        <textarea id="replyText" class="form-control" rows="6">${enquiry.ai_reply || ''}</textarea>
      </div>
      <button class="btn btn-primary" onclick="sendEnquiryReply('${enquiry.id}')">Send Reply</button>
    `;

    document.getElementById('enquiryList').style.display = 'none';
    document.getElementById('enquiryDetail').style.display = 'block';
  } catch (error) {
    await showModal(`Error loading enquiry: ${error.message}`, { title: 'Error', showCancel: false });
  }
}

async function sendEnquiryReply(enquiryId) {
  const reply = document.getElementById('replyText').value;
  if (!reply.trim()) {
    await showModal('Please enter a reply', { title: 'Validation', showCancel: false });
    return;
  }

  try {
    await apiClient.replyEnquiry(enquiryId, reply);
    await showModal('Reply sent successfully', { title: 'Success', showCancel: false });
    closeEnquiryDetail();
    loadDashboardData();
  } catch (error) {
    await showModal(`Error sending reply: ${error.message}`, { title: 'Error', showCancel: false });
  }
}

async function deleteEnquiryConfirm(enquiryId) {
  const confirmed = await showModal('Are you sure you want to delete this enquiry?', { title: 'Confirm', showCancel: true });
  if (!confirmed) {
    return;
  }

  try {
    await apiClient.deleteEnquiry(enquiryId);
    await showModal('Enquiry deleted successfully', { title: 'Success', showCancel: false });
    loadDashboardData();
  } catch (error) {
    await showModal(`Error deleting enquiry: ${error.message}`, { title: 'Error', showCancel: false });
  }
}

function closeEnquiryDetail() {
  document.getElementById('enquiryList').style.display = 'block';
  document.getElementById('enquiryDetail').style.display = 'none';
}

async function loadTickets(tickets) {
  const tbody = document.getElementById('ticketsTable');
  if (!tbody) return;

  tbody.innerHTML = '';
  const emptyEl = document.getElementById('ticketsEmpty');
  if (tickets.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  tickets.forEach(ticket => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${ticket.subject}</td>
      <td>${ticket.contact_name}</td>
      <td>${ticket.company_name || 'N/A'}</td>
      <td><span class="badge badge-${ticket.customer_type}">${ticket.customer_type}</span></td>
      <td><span class="status-badge ${ticket.status}">${ticket.status}</span></td>
      <td>${new Date(ticket.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewTicket('${ticket.id}')">View</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTicketConfirm('${ticket.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function viewTicket(ticketId) {
  try {
    const response = await apiClient.getTicket(ticketId);
    const ticket = response.ticket;

  const detailContent = document.getElementById('ticketDetailContent');
  detailContent.innerHTML = `
      <h3>${ticket.subject}</h3>
      <div class="detail-row">
        <div class="detail-item">
          <label>Contact:</label>
          <p>${ticket.contact_name} (${ticket.contact_email})</p>
        </div>
        <div class="detail-item">
          <label>Company:</label>
          <p>${ticket.company_name || 'N/A'}</p>
        </div>
        <div class="detail-item">
          <label>Customer Type:</label>
          <p>${ticket.customer_type}</p>
        </div>
        <div class="detail-item">
          <label>Status:</label>
          <p><span class="status-badge ${ticket.status}">${ticket.status}</span></p>
        </div>
      </div>
      <div class="detail-item">
        <label>Issue Details:</label>
        <p>${ticket.issue}</p>
      </div>
      <div class="detail-item">
        <label>AI-Generated Reply:</label>
        <textarea id="replyText" class="form-control" rows="6">${ticket.ai_reply || ''}</textarea>
      </div>
      <button class="btn btn-primary" onclick="sendTicketReply('${ticket.id}')">Send Reply</button>
      ${ticket.status !== 'resolved' ? `<button class="btn btn-success" onclick="resolveTicket('${ticket.id}')">Resolve Ticket</button>` : ''}
    `;

    document.getElementById('ticketList').style.display = 'none';
    document.getElementById('ticketDetail').style.display = 'block';
  } catch (error) {
    await showModal(`Error loading ticket: ${error.message}`, { title: 'Error', showCancel: false });
  }
}

async function sendTicketReply(ticketId) {
  const reply = document.getElementById('replyText').value;
  if (!reply.trim()) {
    await showModal('Please enter a reply', { title: 'Validation', showCancel: false });
    return;
  }

  try {
    await apiClient.replyTicket(ticketId, reply);
    await showModal('Reply sent successfully', { title: 'Success', showCancel: false });
    closeTicketDetail();
    loadDashboardData();
  } catch (error) {
    await showModal(`Error sending reply: ${error.message}`, { title: 'Error', showCancel: false });
  }
}

async function resolveTicket(ticketId) {
  try {
    await apiClient.resolveTicket(ticketId);
    await showModal('Ticket resolved successfully', { title: 'Success', showCancel: false });
    closeTicketDetail();
    loadDashboardData();
  } catch (error) {
    await showModal(`Error resolving ticket: ${error.message}`, { title: 'Error', showCancel: false });
  }
}

async function deleteTicketConfirm(ticketId) {
  const confirmed = await showModal('Are you sure you want to delete this ticket?', { title: 'Confirm', showCancel: true });
  if (!confirmed) {
    return;
  }

  try {
    await apiClient.deleteTicket(ticketId);
    await showModal('Ticket deleted successfully', { title: 'Success', showCancel: false });
    loadDashboardData();
  } catch (error) {
    await showModal(`Error deleting ticket: ${error.message}`, { title: 'Error', showCancel: false });
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) {
    showModal(message, { title: 'Notice', showCancel: false });
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
  }, 2500);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function deleteContactConfirm(contactId) {
  const confirmed = await showModal('Are you sure you want to delete this contact?', { title: 'Confirm', showCancel: true });
  if (!confirmed) {
    return;
  }

  try {
    await apiClient.deleteContact(contactId);
    showToast('Contact deleted successfully', 'success');
    loadDashboardData();
  } catch (error) {
    showToast(error.message || 'Failed to delete contact', 'error');
  }
}

async function editContact(contactId) {
  try {
    const response = await apiClient.getContact(contactId);
    const contact = response.contact;
    openContactEditModal(contact);
  } catch (error) {
    showToast(error.message || 'Failed to update contact', 'error');
  }
}

function openContactEditModal(contact) {
  const modal = document.getElementById('contactEditModal');
  if (!modal) return;

  editingContactId = contact.id;
  document.getElementById('contactEditName').value = contact.name || '';
  document.getElementById('contactEditEmail').value = contact.email || '';
  document.getElementById('contactEditPhone').value = contact.phone || '';
  document.getElementById('contactEditCompany').value = contact.company_name || '';

  modal.style.display = 'flex';
}

function closeContactEditModal() {
  const modal = document.getElementById('contactEditModal');
  if (!modal) return;
  modal.style.display = 'none';
  editingContactId = null;
}

async function submitContactEditForm() {
  if (!editingContactId) {
    showToast('Contact not selected', 'error');
    return;
  }

  const name = document.getElementById('contactEditName').value.trim();
  const email = document.getElementById('contactEditEmail').value.trim();
  const phone = document.getElementById('contactEditPhone').value.trim();
  const companyName = document.getElementById('contactEditCompany').value.trim();

  if (!name) {
    showToast('Name is required', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  if (!isValidPhone(phone)) {
    showToast('Invalid phone number', 'error');
    return;
  }

  try {
    await apiClient.updateContact(editingContactId, {
      name,
      email,
      phone: phone || null,
      company_name: companyName || null,
    });
    showToast('Contact updated successfully', 'success');
    closeContactEditModal();
    loadDashboardData();
  } catch (error) {
    showToast(error.message || 'Failed to update contact', 'error');
  }
}

function closeTicketDetail() {
  document.getElementById('ticketList').style.display = 'block';
  document.getElementById('ticketDetail').style.display = 'none';
}

function loadContacts(contacts) {
  const tbody = document.getElementById('contactsTable');
  if (!tbody) return;

  tbody.innerHTML = '';
  const emptyEl = document.getElementById('contactsEmpty');
  if (contacts.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  contacts.forEach(contact => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contact.name}</td>
      <td>${contact.email}</td>
      <td>${contact.phone || 'N/A'}</td>
      <td>${contact.company_name || 'N/A'}</td>
      <td><span class="badge badge-${contact.customer_type}">${contact.customer_type}</span></td>
      <td>${new Date(contact.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editContact('${contact.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteContactConfirm('${contact.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}
