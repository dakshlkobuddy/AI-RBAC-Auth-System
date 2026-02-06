document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('setPasswordForm');
  const errorEl = document.getElementById('setPasswordError');
  const successEl = document.getElementById('setPasswordSuccess');

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    showError('Invalid or missing setup link. Please request a new one.');
    form.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? 'Hide' : 'Show';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!newPassword || newPassword.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    try {
      await apiClient.setPasswordWithToken(token, newPassword);
      showSuccess('Password set successfully. You can now login.');
      form.reset();
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } catch (error) {
      showError(error.message || 'Failed to set password.');
    }
  });

  function clearMessages() {
    errorEl.textContent = '';
    successEl.textContent = '';
    successEl.style.display = 'none';
  }

  function showError(message) {
    errorEl.textContent = message;
  }

  function showSuccess(message) {
    successEl.textContent = message;
    successEl.style.display = 'block';
  }
});
