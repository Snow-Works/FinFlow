/**
 * FINFLOW LIVE DASHBOARD WORKSPACE STATE ENGINE
 * Handles real-time DOM reconciliation and Express REST operations.
 */

const ENDPOINT_BASE = 'http://localhost:3000/api';

// Live Engine Reactive Cache Repositories
let systemVaults = [];
let ledgerRecords = [];

// Fallback Account Profile Metadata Frame
const fallbackProfile = {
  fullName: "Michael Samuel",
  email: "snowworks.design@gmail.com"
};

document.addEventListener('DOMContentLoaded', () => {
  bootstrapRealtimeWorkspace();
  setupGlobalClickDismissers();
});

/**
 * Boots core layout pipelines, pulling data profiles and runtime structures
 */
async function bootstrapRealtimeWorkspace() {
  renderUserIdentityProfile();
  
  // Simultaneously pull endpoints over state threads
  await Promise.all([
    syncSystemVaultsPipeline(),
    syncLedgerRecordsPipeline()
  ]);
  
  reactivelySyncCategoryDropdown('expense');
}

/**
 * Extracts account metadata parameters to build interactive header blocks
 */
function renderUserIdentityProfile() {
  const profileName = fallbackProfile.fullName;
  const profileEmail = fallbackProfile.email;

  // Extract capital uppercase character symbols safely
  const parts = profileName.split(' ');
  const initials = parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();

  // Route symbols directly inside structural nodes
  document.getElementById('user-avatar-initials').textContent = initials;
  document.getElementById('user-display-name-nav').textContent = profileName;
  document.getElementById('dropdown-profile-name').textContent = profileName;
  document.getElementById('dropdown-profile-email').textContent = profileEmail;
}

/**
 * Contextual toggles for the user profile header window block
 */
function toggleProfileDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('profile-dropdown');
  dropdown.classList.toggle('active');
}

function setupGlobalClickDismissers() {
  document.addEventListener('click', () => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown && dropdown.classList.contains('active')) {
      dropdown.classList.remove('active');
    }
  });
}

/**
 * Syncs the local budget state datasets with the Express backend service
 */
async function syncSystemVaultsPipeline() {
  try {
    const response = await fetch(`${ENDPOINT_BASE}/budgets`);
    if (!response.ok) throw new Error('Failed to retrieve vault schema array data');
    systemVaults = await response.json();
    rebuildVaultCapacityProgressBars();
  } catch (error) {
    console.error('[LIVE VAULT ERROR] Synchronization breakdown:', error);
  }
}

/**
 * Downstreams transaction rows from master server state lists
 */
async function syncLedgerRecordsPipeline() {
  try {
    const response = await fetch(`${ENDPOINT_BASE}/transactions`);
    if (!response.ok) throw new Error('Failed to down-link transaction stream matrices');
    const structure = await response.json();
    
    // Support either clean arrays or raw wrapped status payload envelopes
    ledgerRecords = structure.data || structure;
    
    calculateRunningLiquidityTotals();
    rebuildLiveLedgerTableGrid();
  } catch (error) {
    console.error('[LIVE LEDGER ERROR] Inbound track download breakdown:', error);
  }
}

/**
 * Parses tracking primitives to execute balanced tracking states
 */
function calculateRunningLiquidityTotals() {
  let netInbound = 0;
  let netOutbound = 0;

  ledgerRecords.forEach(record => {
    const quantum = Number(record.amount) || 0;
    if (record.type === 'income') {
      netInbound += quantum;
    } else if (record.type === 'expense') {
      netOutbound += quantum;
    }
  });

  const aggregateLiquidity = netInbound - netOutbound;

  // Render text transformations directly inside active visual positions
  document.getElementById('total-income-display').textContent = `$${netInbound.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  document.getElementById('total-expenses-display').textContent = `$${netOutbound.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  
  const liquiditySelector = document.getElementById('net-liquidity-display');
  liquiditySelector.textContent = `$${aggregateLiquidity.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  
  // Flag negative balances immediately for user clarity
  if (aggregateLiquidity < 0) {
    liquiditySelector.style.color = '#d94141';
  } else {
    liquiditySelector.style.color = 'var(--text-primary)';
  }
}

/**
 * Computes live consumption metrics to render fluid progress indicators
 */
function rebuildVaultCapacityProgressBars() {
  const container = document.getElementById('reactive-vaults-stack');
  if (!container) return;
  container.innerHTML = '';

  systemVaults.forEach(vault => {
    // Dynamically query real true expenditures matching target categories
    const computedExpenseTotal = ledgerRecords
      .filter(r => r.category.toLowerCase() === vault.category.toLowerCase() && r.type === 'expense')
      .reduce((accumulator, current) => accumulator + (Number(current.amount) || 0), 0);

    const completionRatio = Math.min((computedExpenseTotal / vault.allocated) * 100, 100);

    const vaultElementMarkup = `
      <div class="vault-wrapper">
        <div class="vault-meta-row">
          <span class="vault-name-txt">${vault.category}</span>
          <div>
            <span style="color: var(--text-primary); font-weight: 700;">$${computedExpenseTotal.toFixed(0)}</span>
            <span style="color: var(--text-muted); font-size:0.7rem;"> / $${vault.allocated}</span>
          </div>
        </div>
        <div class="vault-channel">
          <div class="vault-fill-progress" 
               style="width: ${completionRatio}%; background-color: ${vault.color || 'var(--mocha)'};">
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', vaultElementMarkup);
  });
}

/**
 * Dynamically updates selection option sets inside data input vectors
 */
function reactivelySyncCategoryDropdown(flowDirection) {
  const dropdown = document.getElementById('tx-category');
  if (!dropdown) return;
  dropdown.innerHTML = '';

  if (flowDirection === 'income') {
    const incomeVectors = ['Income', 'Investment Returns', 'Capital Subsidy'];
    incomeVectors.forEach(v => {
      dropdown.insertAdjacentHTML('beforeend', `<option value="${v}">${v}</option>`);
    });
  } else {
    if (systemVaults.length === 0) {
      dropdown.insertAdjacentHTML('beforeend', `<option value="Uncategorized">Uncategorized</option>`);
    } else {
      systemVaults.forEach(v => {
        dropdown.insertAdjacentHTML('beforeend', `<option value="${v.category}">${v.category}</option>`);
      });
    }
  }
}

/**
 * Generates rows for the real-time transaction ledger table
 */
function rebuildLiveLedgerTableGrid() {
  const gridAnchor = document.getElementById('reactive-ledger-rows');
  const emptyState = document.getElementById('ledger-empty-state');
  if (!gridAnchor) return;

  gridAnchor.innerHTML = '';

  if (ledgerRecords.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  // Sort descending by id to show newest entries first
  const sequentialRecords = [...ledgerRecords].sort((alpha, beta) => beta.id - alpha.id);

  sequentialRecords.forEach(record => {
    const isInflow = record.type === 'income';
    const characterToken = isInflow ? '+' : '-';
    const modificationClass = isInflow ? 'flow-in' : 'flow-out';
    
    // Parse calendar strings gracefully
    const structuralDate = record.date || new Date().toISOString().split('T')[0];

    const rowMarkup = `
      <tr>
        <td>
          <span class="tx-main-desc">${record.description}</span>
          <span class="tx-time-stamp">${structuralDate}</span>
        </td>
        <td><span class="table-badge">${record.category}</span></td>
        <td class="text-right">
          <span class="amt-value-badge ${modificationClass}">
            ${characterToken}$${Number(record.amount).toFixed(2)}
          </span>
        </td>
      </tr>
    `;
    gridAnchor.insertAdjacentHTML('beforeend', rowMarkup);
  });
}

/**
 * Dispatches a POST request to commit a new transaction to the server arrays
 */
async function handleLogTransaction(event) {
  event.preventDefault();

  const descriptionNode = document.getElementById('tx-description');
  const amountNode = document.getElementById('tx-amount');
  const typeNode = document.getElementById('tx-type');
  const categoryNode = document.getElementById('tx-category');

  const description = descriptionNode.value.trim();
  const amount = parseFloat(amountNode.value);
  const type = typeNode.value;
  const category = categoryNode.value;

  if (!description || isNaN(amount) || amount <= 0) return;

  const entryPayload = { description, amount, type, category };

  try {
    const response = await fetch(`${ENDPOINT_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryPayload)
    });

    if (!response.ok) throw new Error('Transaction authorized submission rejected by validation rules');

    // Reset input fields cleanly
    document.getElementById('realtime-transaction-form').reset();
    
    // Force a fresh state pull
    await syncLedgerRecordsPipeline();
    rebuildVaultCapacityProgressBars();
    reactivelySyncCategoryDropdown(typeNode.value);

  } catch (error) {
    console.error('[TRANSACTION PIPELINE CRITICAL RUNTIME EXCEPTION]', error);
    alert('Failed to process transaction. Verify backend engine configuration constraints.');
  }
}

/**
 * Dispatches a POST request to create a new budget category/vault on the server
 */
async function handleCreateVault(event) {
  event.preventDefault();
  
  const categoryInput = document.getElementById('vault-name');
  const allocationInput = document.getElementById('vault-allocation');
  const colorInput = document.getElementById('vault-color');

  const category = categoryInput.value.trim();
  const allocated = parseFloat(allocationInput.value);
  const color = colorInput.value;

  if (!category || isNaN(allocated) || allocated <= 0) return;

  const vaultPayload = { category, allocated, spent: 0, currency: "USD", color };

  try {
    const response = await fetch(`${ENDPOINT_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vaultPayload)
    });

    if (!response.ok) throw new Error('Vault deploy schema execution rejected by routing layer.');

    document.getElementById('new-vault-form').reset();
    closeNewVaultModal();
    
    // Force complete re-sync across components
    await syncSystemVaultsPipeline();
    reactivelySyncCategoryDropdown(document.getElementById('tx-type').value);

  } catch (error) {
    console.error('[VAULT CREATION EXCEPTION]', error);
    alert('Failed to initialize dynamic cap container framework channels.');
  }
}

/* Modal UI Control Methods */
function openNewVaultModal() { document.getElementById('vault-modal').classList.remove('hidden'); }
function closeNewVaultModal() { document.getElementById('vault-modal').classList.add('hidden'); }

function executeSecureLogout() {
  window.location.href = '../index.html';
}