/* ==========================================================================
   FINLY SECURE STANDALONE CHECKOUT CONTROLLER
   · Handles responsive input masking (Card Spaces & Expiry Slashes)
   · Real-time card type indicator engine (Visa, Mastercard, Verve)
   · Simulated secure banking multi-phase transaction logic
   · Application router redirection drop
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const statusScreen = document.getElementById('payment-status-screen');
  const statusTitle  = document.getElementById('status-title');
  const statusDesc   = document.getElementById('status-desc');
  const paymentForm  = document.getElementById('secure-payment-form');

  // Expose hooks globally so HTML inline events can access them safely
  window.formatCardNumber = function(input) {
    // Strip all non-digits and spaces
    let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    
    // Group card numbers cleanly by chunks of 4 digits
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += value[i];
    }
    input.value = formatted;

    // Real-time Card Brand Parser Indicator
    const typeIndicator = document.getElementById('card-type-logo');
    if (!typeIndicator) return;

    if (value.startsWith('4')) {
      typeIndicator.textContent = 'Visa';
    } else if (/^(5[1-5]|2[2-7])/.test(value)) {
      typeIndicator.textContent = 'Mastercard';
    } else if (/^506[0-1]|^507|^650/.test(value)) {
      typeIndicator.textContent = 'Verve';
    } else if (value.length > 0) {
      typeIndicator.textContent = '💳';
    } else {
      typeIndicator.textContent = '💳';
    }
  };

  window.formatExpiry = function(input) {
    // Strip everything except numeric digits
    let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Auto-inject dividing forward slash block rules
    if (value.length > 2) {
      input.value = value.substr(0, 2) + '/' + value.substr(2, 2);
    } else {
      input.value = value;
    }
  };

  window.handlePaymentSubmission = function(event) {
    event.preventDefault();

    if (!statusScreen || !statusTitle || !statusDesc) return;

    // 1. Mount processing UI loader context screen
    statusScreen.style.display = 'flex';
    statusTitle.textContent = 'Processing Transaction...';
    statusTitle.style.color = 'var(--text-primary, #ffffff)';
    statusDesc.textContent = 'Verifying credentials securely with card issuer network tokens...';

    // 2. Phase 2: Authorizing Hold Sequence Simulation (1.2 Seconds)
    setTimeout(() => {
      statusTitle.textContent = 'Authorizing Hold...';
      statusDesc.textContent = 'Securing modern 14-day tracking allocations from your bank engine.';
    }, 1200);

    // 3. Phase 3: Settle Token Pipelines (2.6 Seconds)
    setTimeout(() => {
      statusTitle.textContent = 'Account Created Setup!';
      // Match premium gold branding token highlight color rule configuration
      statusTitle.style.color = 'var(--gold-bright, #c9923f)';
      statusDesc.textContent = 'Initialization sequence complete. Bootstrapping workspace ledger frames...';
    }, 2600);

    // 4. Phase 4: Final Routing Dispatch execution drop (3.8 Seconds)
    setTimeout(() => {
      window.location.href = 'app-dashboard.html';
    }, 3800);
  };
});