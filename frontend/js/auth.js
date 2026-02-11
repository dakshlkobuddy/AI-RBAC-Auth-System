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
        if (!isValidEmail(email)) {
          errorMessage.textContent = 'Please enter a valid email address';
          return;
        }
        if (!password || password.length < 6) {
          errorMessage.textContent = 'Password must be at least 6 characters';
          return;
        }

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
        const message = (error.message || '').toLowerCase();
        if (message.includes('invalid email or password')) {
          errorMessage.textContent = 'Invalid Credentials';
        } else {
          errorMessage.textContent = error.message || 'Invalid Credentials';
        }
      }
    });
  }

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.classList.toggle('is-visible', isPassword);
    });
  });
});

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').toLowerCase());
}

// Logout function
function logout() {
  apiClient.removeToken();
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Check if user is authenticated
async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return false;
  }

  try {
    const response = await apiClient.getCurrentUser();
    if (!response?.success || !response?.user) {
      throw new Error('Invalid session');
    }
    localStorage.setItem('user', JSON.stringify(response.user));
    return true;
  } catch (error) {
    apiClient.removeToken();
    localStorage.removeItem('user');
    window.location.href = 'index.html';
    return false;
  }
}

// Get current user
function getCurrentUser() {
  const userJSON = localStorage.getItem('user');
  return userJSON ? JSON.parse(userJSON) : null;
}
