/* ==========================================================================
   AUTHENTICATION LOGIC ENGINE WITH PASS-SEE VISIBILITY MATRIX
   ========================================================================== */

function switchForm(view) {
  document.getElementById('tab-login').classList.toggle('active', view === 'login');
  document.getElementById('tab-signup').classList.toggle('active', view === 'signup');

  document.getElementById('login-form').classList.toggle('active', view === 'login');
  document.getElementById('signup-form').classList.toggle('active', view === 'signup');

  clearErrors();
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  document.querySelectorAll('input').forEach(input => input.classList.remove('invalid'));
}

function showError(inputId, errorId, message) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  
  if (inputElement && errorElement) {
    inputElement.classList.add('invalid');
    errorElement.textContent = message;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Dynamic Field Visibility Matrix Switching Controller */
function togglePasswordVisibility(targetFieldId, toggleButton) {
  const passwordInput = document.getElementById(targetFieldId);
  if (!passwordInput) return;

  const openIcon = toggleButton.querySelector('.eye-open');
  const closedIcon = toggleButton.querySelector('.eye-closed');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    openIcon.style.display = 'none';
    closedIcon.style.display = 'block';
  } else {
    passwordInput.type = 'password';
    openIcon.style.display = 'block';
    closedIcon.style.display = 'none';
  }
}

// Login verification entry stream tracking
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  let hasErrors = false;

  if (!email) {
    showError('login-email', 'error-login-email', 'Email address is required.');
    hasErrors = true;
  } else if (!isValidEmail(email)) {
    showError('login-email', 'error-login-email', 'Please enter a valid email address.');
    hasErrors = true;
  }

  if (!password) {
    showError('login-password', 'error-login-password', 'Password is required.');
    hasErrors = true;
  }

  if (!hasErrors) {
    console.log('Handshake passed:', { email });
  }
});

// Registration tracking validation rules
document.getElementById('signup-form').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  let hasErrors = false;

  if (!name) {
    showError('signup-name', 'error-signup-name', 'Full name is required.');
    hasErrors = true;
  } else if (name.length < 2) {
    showError('signup-name', 'error-signup-name', 'Name must be at least 2 characters.');
    hasErrors = true;
  }

  if (!email) {
    showError('signup-email', 'error-signup-email', 'Email address is required.');
    hasErrors = true;
  } else if (!isValidEmail(email)) {
    showError('signup-email', 'error-signup-email', 'Please enter a valid email address.');
    hasErrors = true;
  }

  if (!password) {
    showError('signup-password', 'error-signup-password', 'Password is required.');
    hasErrors = true;
  } else if (password.length < 8) {
    showError('signup-password', 'error-signup-password', 'Password must be at least 8 characters.');
    hasErrors = true;
  }

  if (!confirm) {
    showError('signup-confirm', 'error-signup-confirm', 'Please re-type your password.');
    hasErrors = true;
  } else if (password !== confirm) {
    showError('signup-confirm', 'error-signup-confirm', 'Passwords do not match.');
    hasErrors = true;
  }

  if (!hasErrors) {
    console.log('Registration passed:', { name, email });
  }
});