/* ============================================
   FINLY — script.js
   DecodeLabs Project 1
   Features:
   · Dark / Light mode toggle (desktop + mobile)
   · Mobile slide-in menu + backdrop
   · Navbar scroll shadow
   · Billing period toggle (monthly / annual)
   · Close menu on nav link click
   ============================================ */

/* ── 1. THEME TOGGLE ── */
const html            = document.documentElement;
const themeToggleBtn  = document.getElementById('theme-toggle-desktop');
const mobileLightBtn  = document.getElementById('mobile-light-btn');
const mobileDarkBtn   = document.getElementById('mobile-dark-btn');

const THEME_KEY = 'finly-theme';

// Initialise from localStorage or default to light
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved, false);
}

function applyTheme(theme, save = true) {
  html.setAttribute('data-theme', theme);

  // Update desktop toggle aria-label
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  // Update mobile pills
  if (mobileLightBtn && mobileDarkBtn) {
    mobileLightBtn.classList.toggle('active', theme === 'light');
    mobileDarkBtn.classList.toggle('active',  theme === 'dark');
    mobileLightBtn.setAttribute('aria-pressed', String(theme === 'light'));
    mobileDarkBtn.setAttribute('aria-pressed',  String(theme === 'dark'));
  }

  if (save) localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = html.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Desktop toggle
themeToggleBtn?.addEventListener('click', toggleTheme);

// Mobile pills
mobileLightBtn?.addEventListener('click', () => applyTheme('light'));
mobileDarkBtn?.addEventListener('click',  () => applyTheme('dark'));

// Init on load
initTheme();


/* ── 2. MOBILE MENU ── */
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobile-menu');
const mobileClose  = document.getElementById('mobile-close');
const backdrop     = document.getElementById('menu-backdrop');
const closeLinks   = document.querySelectorAll('[data-close-menu]');

function openMenu() {
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('active');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Close navigation menu');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('active');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation menu');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});

mobileClose?.addEventListener('click', closeMenu);
backdrop?.addEventListener('click', closeMenu);

// Close on any nav link click inside menu
closeLinks.forEach(link => link.addEventListener('click', closeMenu));

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
});


/* ── 3. NAVBAR SCROLL SHADOW ── */
const navbar = document.querySelector('.navbar');

const scrollObserver = new IntersectionObserver(
  ([entry]) => {
    navbar?.classList.toggle('scrolled', !entry.isIntersecting);
  },
  { threshold: 0, rootMargin: '-72px 0px 0px 0px' }
);

// Observe the hero section top
const heroSection = document.getElementById('hero');
if (heroSection) scrollObserver.observe(heroSection);


/* ── 4. BILLING TOGGLE ── */
const billingBtn     = document.getElementById('billing-toggle');
const priceAmounts   = document.querySelectorAll('.price-amount');
const monthlyLabel   = document.getElementById('toggle-monthly');
const annualLabel    = document.getElementById('toggle-annual');

let isAnnual = false;

function updatePrices() {
  priceAmounts.forEach(el => {
    el.textContent = isAnnual
      ? el.getAttribute('data-annual')
      : el.getAttribute('data-monthly');
  });
}

billingBtn?.addEventListener('click', () => {
  isAnnual = !isAnnual;
  billingBtn.setAttribute('aria-checked', String(isAnnual));

  monthlyLabel?.classList.toggle('active', !isAnnual);
  annualLabel?.classList.toggle('active',  isAnnual);

  updatePrices();
});


/* ── 5. SMOOTH ACTIVE NAV LINK ── */
const sections   = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

function setActiveLink() {
  let current = '';
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top <= 100) current = section.getAttribute('id');
  });

  navAnchors.forEach(a => {
    a.classList.remove('active-link');
    if (a.getAttribute('href') === `#${current}`) {
      a.classList.add('active-link');
    }
  });
}

window.addEventListener('scroll', setActiveLink, { passive: true });


/* ── 6. API INTEGRATION (Project 2) ── */
const API_BASE = 'http://localhost:3000/api';

// ── 6a. Load dashboard data from API on page load ──
async function loadDashboardData() {
  try {
    const [budgetRes, txRes] = await Promise.all([
      fetch(`${API_BASE}/budgets`),
      fetch(`${API_BASE}/transactions`),
    ]);

    if (!budgetRes.ok || !txRes.ok) throw new Error('API fetch failed');

    const budgetData = await budgetRes.json();
    const txData     = await txRes.json();

    // Update dashboard card bars from live API data
    updateDashboardBars(budgetData.data);

    // Update dashboard stat figures
    updateDashboardStats(txData.summary);

  } catch (err) {
    // Silently fail — static mockup remains visible
    console.warn('[Finly] API not reachable, using static dashboard data.');
  }
}

function updateDashboardBars(budgets) {
  const rows = document.querySelectorAll('.bar-row');
  budgets.forEach((budget, i) => {
    if (!rows[i]) return;
    const fill = rows[i].querySelector('.bar-fill');
    const pct  = rows[i].querySelectorAll('span');
    if (fill) fill.style.width = budget.percentage + '%';
    if (pct[1]) pct[1].textContent = budget.percentage + '%';
  });
}

function updateDashboardStats(summary) {
  const statVals = document.querySelectorAll('.stat-val');
  if (!statVals.length) return;
  const spent   = summary?.totalExpense;
  const saved   = summary?.netBalance;
  if (statVals[0] && spent)  statVals[0].textContent = '$' + spent.toLocaleString();
  if (statVals[1] && saved)  statVals[1].textContent = '$' + saved.toLocaleString();
}

// ── 6b. Waitlist form — wire "Get Started" CTA ──
function initWaitlistForm() {
  // Inject a minimal inline form into the hero CTA area
  const heroCtas = document.querySelector('.hero-ctas');
  if (!heroCtas) return;

  // Create modal on "Start Free Trial" click
  const trialBtn = heroCtas.querySelector('.btn-primary');
  if (!trialBtn) return;

  trialBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openWaitlistModal();
  });
}

function openWaitlistModal() {
  // Remove existing modal if open
  document.getElementById('waitlist-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'waitlist-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Join Finly waitlist');
  modal.innerHTML = `
    <div class="wl-backdrop"></div>
    <div class="wl-card">
      <button class="wl-close" aria-label="Close">&times;</button>
      <p class="wl-eyebrow">Join the Waitlist</p>
      <h2 class="wl-title">Start Your Free Trial</h2>
      <p class="wl-sub">No credit card required. We'll send you early access.</p>
      <form class="wl-form" id="waitlist-form" novalidate>
        <div class="wl-field">
          <label for="wl-name">Full Name</label>
          <input type="text" id="wl-name" name="name" placeholder="e.g. Michael Samuel" autocomplete="name" />
          <span class="wl-error" id="wl-name-error"></span>
        </div>
        <div class="wl-field">
          <label for="wl-email">Email Address</label>
          <input type="email" id="wl-email" name="email" placeholder="you@email.com" autocomplete="email" />
          <span class="wl-error" id="wl-email-error"></span>
        </div>
        <div class="wl-field">
          <label for="wl-plan">Interested Plan</label>
          <select id="wl-plan" name="plan">
            <option value="free">Free</option>
            <option value="pro" selected>Pro — $12/mo</option>
            <option value="team">Team — $29/mo</option>
          </select>
        </div>
        <div class="wl-api-error" id="wl-api-error" hidden></div>
        <button type="submit" class="btn btn-primary wl-submit">
          <span class="wl-btn-text">Join Waitlist</span>
          <span class="wl-btn-loading" hidden>Submitting...</span>
        </button>
      </form>
      <div class="wl-success" id="wl-success" hidden>
        <span class="wl-success-icon"><img src="images/finly main logo.svg" alt="Finly Logo"></span>
        <p id="wl-success-msg">You're on the list!</p>
        <p class="wl-success-sub">Check your inbox for early access details.</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Inject modal styles
  injectModalStyles();

  // Focus first input
  setTimeout(() => modal.querySelector('#wl-name')?.focus(), 100);

  // Close handlers
  modal.querySelector('.wl-backdrop').addEventListener('click', closeWaitlistModal);
  modal.querySelector('.wl-close').addEventListener('click', closeWaitlistModal);
  document.addEventListener('keydown', handleModalEsc);

  // Form submit
  modal.querySelector('#waitlist-form').addEventListener('submit', handleWaitlistSubmit);
}

function closeWaitlistModal() {
  document.getElementById('waitlist-modal')?.remove();
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleModalEsc);
}

function handleModalEsc(e) {
  if (e.key === 'Escape') closeWaitlistModal();
}

async function handleWaitlistSubmit(e) {
  e.preventDefault();

  const form     = e.target;
  const name     = form.querySelector('#wl-name').value.trim();
  const email    = form.querySelector('#wl-email').value.trim();
  const plan     = form.querySelector('#wl-plan').value;
  const btnText  = form.querySelector('.wl-btn-text');
  const btnLoad  = form.querySelector('.wl-btn-loading');
  const apiError = document.getElementById('wl-api-error');

  // Clear previous errors
  document.getElementById('wl-name-error').textContent  = '';
  document.getElementById('wl-email-error').textContent = '';
  apiError.hidden = true;

  // Client-side validation
  let hasError = false;
  if (!name || name.length < 2) {
    document.getElementById('wl-name-error').textContent = 'Please enter your full name';
    hasError = true;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('wl-email-error').textContent = 'Please enter a valid email';
    hasError = true;
  }
  if (hasError) return;

  // Loading state
  btnText.hidden = true;
  btnLoad.hidden = false;

  try {
    const response = await fetch(`${API_BASE}/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, plan }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Show API error (e.g. duplicate email)
      apiError.textContent = data.message || 'Something went wrong. Please try again.';
      apiError.hidden = false;
      btnText.hidden = false;
      btnLoad.hidden = true;
      return;
    }

    // Success state
    form.hidden = true;
    const successEl = document.getElementById('wl-success');
    document.getElementById('wl-success-msg').textContent = data.message;
    successEl.hidden = false;

    // Auto-close after 3s
    setTimeout(closeWaitlistModal, 3000);

  } catch (err) {
    apiError.textContent = 'Could not connect to server. Please try again.';
    apiError.hidden = false;
    btnText.hidden = false;
    btnLoad.hidden = true;
  }
}

function injectModalStyles() {
  if (document.getElementById('wl-styles')) return;
  const style = document.createElement('style');
  style.id = 'wl-styles';
  style.textContent = `
    #waitlist-modal { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .wl-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); }
    .wl-card { position: relative; background: var(--bg-card, #fff); border: 1px solid var(--border-bright); border-radius: 20px; padding: 2.5rem 2rem; max-width: 440px; width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,0.25); animation: wlSlideUp 0.3s cubic-bezier(0.4,0,0.2,1); }
    @keyframes wlSlideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
    .wl-close { position: absolute; top: 1rem; right: 1rem; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .wl-close:hover { background: var(--gold-glow, rgba(165,133,110,0.1)); color: var(--mocha, #A5856E); }
    .wl-eyebrow { font-family: var(--font-heading); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--mocha, #A5856E); margin-bottom: 0.4rem; }
    .wl-title { font-family: var(--font-heading); font-size: clamp(1.4rem, 4vw, 1.9rem); font-weight: 800; color: var(--text-primary); margin-bottom: 0.4rem; letter-spacing: -0.02em; }
    .wl-sub { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; }
    .wl-form { display: flex; flex-direction: column; gap: 1rem; }
    .wl-field { display: flex; flex-direction: column; gap: 0.35rem; }
    .wl-field label { font-family: var(--font-heading); font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.04em; }
    .wl-field input, .wl-field select { padding: 0.7rem 1rem; border-radius: 10px; border: 1px solid var(--border-bright); background: var(--bg, #faf9f6); color: var(--text-primary); font-family: var(--font-body); font-size: 0.95rem; transition: border-color 0.2s, box-shadow 0.2s; outline: none; }
    .wl-field input:focus, .wl-field select:focus { border-color: var(--mocha, #A5856E); box-shadow: 0 0 0 3px var(--gold-glow, rgba(165,133,110,0.15)); }
    .wl-error { font-size: 0.75rem; color: #e05252; min-height: 1em; }
    .wl-api-error { font-size: 0.85rem; color: #e05252; background: rgba(224,82,82,0.08); border: 1px solid rgba(224,82,82,0.2); border-radius: 8px; padding: 0.6rem 0.9rem; }
    .wl-submit { margin-top: 0.5rem; width: 100%; justify-content: center; }
    .wl-success { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding: 1rem 0; }
    .wl-success-icon { font-size: 2.5rem; color: var(--mocha, #A5856E); }
    .wl-success p { font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
    .wl-success-sub { font-size: 0.875rem; color: var(--text-muted) !important; font-family: var(--font-body) !important; font-weight: 400 !important; }
  `;
  document.head.appendChild(style);
}

// ── Init all API features on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  initWaitlistForm();
});