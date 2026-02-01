/**
 * Authentication Script
 * Handles login functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.textContent = '';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await apiClient.login(email, password);

        if (response.success) {
          apiClient.setToken(response.token);
          localStorage.setItem('user', JSON.stringify(response.user));

          // Redirect to appropriate dashboard based on role
          const role = response.user.role;
          if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
          } else if (role === 'marketing') {
            window.location.href = 'marketing-dashboard.html';
          } else if (role === 'support') {
            window.location.href = 'support-dashboard.html';
          }
        }
      } catch (error) {
        errorMessage.textContent = error.message || 'Login failed';
      }
    });
  }
});

// Logout function
function logout() {
  apiClient.removeToken();
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Check if user is authenticated
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
  }
}

// Get current user
function getCurrentUser() {
  const userJSON = localStorage.getItem('user');
  return userJSON ? JSON.parse(userJSON) : null;
}
