/**
 * Support Dashboard Script
 * Handles support panel functionality
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
}

async function loadDashboardData() {
  try {
    const tickets = await apiClient.getTickets();

    // Update dashboard stats
    if (document.getElementById('totalTickets')) {
      const ticketsList = tickets.tickets || [];
      document.getElementById('totalTickets').textContent = ticketsList.length;
      document.getElementById('openTickets').textContent = ticketsList.filter(t => t.status === 'open').length;
      document.getElementById('inProgressTickets').textContent = ticketsList.filter(t => t.status === 'in_progress').length;
      document.getElementById('resolvedTickets').textContent = ticketsList.filter(t => t.status === 'resolved').length;
    }

    // Load tickets table
    loadTickets(tickets.tickets || []);
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
    tickets: 'Support Tickets',
  };
  document.getElementById('pageTitle').textContent = titles[tabName] || 'Dashboard';
}

async function loadTickets(tickets) {
  const tbody = document.getElementById('ticketsTable');
  if (!tbody) return;

  if (!tickets || tickets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No support tickets found</td></tr>';
    return;
  }

  tbody.innerHTML = '';
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
        <label>AI-Generated Reply (Editable):</label>
        <textarea id="replyText" class="form-control" rows="6">${ticket.ai_reply || ''}</textarea>
      </div>
      <button class="btn btn-primary" onclick="sendTicketReply('${ticket.id}')">Send Reply</button>
      ${ticket.status !== 'resolved' ? `<button class="btn btn-success" onclick="resolveTicket('${ticket.id}')">Resolve Ticket</button>` : ''}
    `;

    document.getElementById('ticketList').style.display = 'none';
    document.getElementById('ticketDetail').style.display = 'block';
  } catch (error) {
    alert('Error loading ticket: ' + error.message);
  }
}

async function resolveTicket(ticketId) {
  try {
    await apiClient.resolveTicket(ticketId);
    alert('Ticket resolved successfully');
    closeTicketDetail();
    loadDashboardData();
  } catch (error) {
    alert('Error resolving ticket: ' + error.message);
  }
}

async function sendTicketReply(ticketId) {
  const reply = document.getElementById('replyText').value;
  if (!reply.trim()) {
    alert('Please enter a reply');
    return;
  }

  try {
    await apiClient.replyTicket(ticketId, reply);
    alert('Reply sent successfully');
    closeTicketDetail();
    loadDashboardData();
  } catch (error) {
    alert('Error sending reply: ' + error.message);
  }
}

function closeTicketDetail() {
  document.getElementById('ticketList').style.display = 'block';
  document.getElementById('ticketDetail').style.display = 'none';
}
