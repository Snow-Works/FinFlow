/* ==========================================================================
   FINFLOW — public/js/profile.js
   REAL-TIME SUBSYSTEM STATE INTERPOLATION & LIFECYCLE RUNTIME CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Bind UI Component Anchors
  const profileTrigger = document.getElementById('navbarProfileIcon'); // Add this ID to your existing profile button/avatar
  const backdrop       = document.getElementById('profileModalBackdrop');
  const closeBtn       = document.getElementById('closeProfileBtn');
  const sessionExitBtn = document.getElementById('logoutProfileBtn');
  const profileForm    = document.getElementById('realtimeProfileForm');
  
  // Bind Text Node Injection Targets
  const avatarInitials = document.getElementById('avatarInitials');
  const displayName    = document.getElementById('profileDisplayName');
  const nameInput      = document.getElementById('profileNameInput');
  const emailInput     = document.getElementById('profileEmailInput');
  const currencySelect = document.getElementById('profileCurrencySelect');
  const statusAlert    = document.getElementById('profileAlertMatrix');
  const progressSpinner= document.getElementById('profileSubmitSpinner');

  // Load signup/active credentials matrix configuration parameters
  let activeUser = JSON.parse(localStorage.getItem('finly_active_user')) || {
    name: "Michael Samuel",
    email: "operator@works.tech",
    currency: "USD"
  };

  // Initialize and load state values
  function syncDashboardProfileView() {
    if (!nameInput) return;
    
    // Auto fill form layers with active credentials
    nameInput.value = activeUser.name;
    emailInput.value = activeUser.email;
    currencySelect.value = activeUser.currency || 'USD';
    
    // Interpolate live text changes instantly
    renderLiveIdentityCard(activeUser.name);
  }

  // Pure state transform logic to generate initials from the current signup name
  function renderLiveIdentityCard(fullName) {
    if (!fullName) return;
    displayName.textContent = fullName;
    
    const tokenChunks = fullName.trim().split(' ');
    let structuralInitials = tokenChunks[0] ? tokenChunks[0].charAt(0) : 'S';
    if (tokenChunks.length > 1 && tokenChunks[tokenChunks.length - 1]) {
      structuralInitials += tokenChunks[tokenChunks.length - 1].charAt(0);
    }
    avatarInitials.textContent = structuralInitials.toUpperCase();
  }

  // Control Visibility States
  window.toggleProfileDashboard = function(isVisible) {
    if (!backdrop) return;
    if (isVisible) {
      syncDashboardProfileView();
      backdrop.classList.add('is-active');
      backdrop.setAttribute('aria-hidden', 'false');
    } else {
      backdrop.classList.remove('is-active');
      backdrop.setAttribute('aria-hidden', 'true');
      resetAlertMatrices();
    }
  };

  // Bind UI Action Events
  if (profileTrigger) profileTrigger.addEventListener('click', () => toggleProfileDashboard(true));
  if (closeBtn)       closeBtn.addEventListener('click', () => toggleProfileDashboard(false));
  
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) toggleProfileDashboard(false);
  });

  function resetAlertMatrices() {
    statusAlert.style.display = 'none';
    statusAlert.className = 'profile-alert';
    document.querySelectorAll('.field-error').forEach(element => element.textContent = '');
  }

  function displayStatusMessage(text, nature) {
    statusAlert.textContent = text;
    statusAlert.className = `profile-alert ${nature}`;
    statusAlert.style.display = 'block';
  }

  // Intercept Form Submission for Real-Time Execution
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetAlertMatrices();

    const postName = nameInput.value.trim();
    const postEmail = emailInput.value.trim();
    let integrityChecked = true;

    if (postName.length < 2) {
      document.getElementById('errorProfileName').textContent = 'Name require length constraints of 2+ characters.';
      integrityChecked = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(postEmail)) {
      document.getElementById('errorProfileEmail').textContent = 'Please enter a valid communications email email framework.';
      integrityChecked = false;
    }

    if (!integrityChecked) return;

    progressSpinner.style.display = 'inline-block';

    try {
      // Execute the live data mutation network request loop
      const networkResponse = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: postName,
          email: postEmail,
          currency: currencySelect.value
        })
      });

      const responsePayload = await networkResponse.json();

      if (responsePayload.status === 'success') {
        // Hydrate frontend cache pipelines
        localStorage.setItem('finly_active_user', JSON.stringify(responsePayload.data));
        activeUser = responsePayload.data;
        
        // Dynamic live DOM injection into active interface without refreshing
        renderLiveIdentityCard(activeUser.name);
        displayStatusMessage('Profile changes securely synchronized in real-time!', 'success');
        
        // Dynamically update your main dashboard header greeting if present
        const mainGreetingElement = document.getElementById('dashboardUserGreeting');
        if (mainGreetingElement) {
          mainGreetingElement.textContent = activeUser.name;
        }

        // Close modal automatically after a brief delay
        setTimeout(() => toggleProfileDashboard(false), 1300);
      } else {
        displayStatusMessage(responsePayload.message, 'error');
      }
    } catch (err) {
      console.warn('[OFFLINE DETECTION] Redirecting transactions execution paths inside local storage proxy array loop patterns.');
      
      const offlineObjectMock = { name: postName, email: postEmail, currency: currencySelect.value };
      localStorage.setItem('finly_active_user', JSON.stringify(offlineObjectMock));
      activeUser = offlineObjectMock;
      
      renderLiveIdentityCard(activeUser.name);
      displayStatusMessage('Changes saved locally (Server offline). Syncing matches pending connection.', 'success');
    } finally {
      progressSpinner.style.display = 'none';
    }
  });

  // Session destruction route
  sessionExitBtn.addEventListener('click', () => {
    localStorage.removeItem('finly_active_user');
    displayStatusMessage('Session destroyed. Re-routing initialization indices...', 'error');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
  });

  // Self-booting script loop setup execution
  syncDashboardProfileView();
});