/* ==========================================================================
   FINFLOW — routes/profile.js
   REAL-TIME DATA TRANSFORMATION & MUTATION MANAGEMENT CORE ENDPOINTS
   ========================================================================== */

const express = require('express');
const router  = express.Router();

// Mock Account Record Memory Store (Simulates Database State)
let userRegistryStore = {
  id: "usr_992104x",
  name: "Michael Samuel", // Fallback state if registration cache is completely empty
  email: "operator@works.tech",
  currency: "USD",
  tierStatus: "Pro Specialist"
};

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/profile
   Resolves current persistence parameters inside standard execution timelines
   ───────────────────────────────────────────────────────────────────────── */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: userRegistryStore
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   PUT /api/profile/update
   Mutates structural attributes in step with active UI form states
   ───────────────────────────────────────────────────────────────────────── */
router.put('/update', (req, res) => {
  const { name, email, currency } = req.body;

  // Defensive Input Validations
  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Processing failure: Full structural name must be at least 2 characters.'
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Processing failure: Invalid target communication formatting.'
    });
  }

  // Commit real-time mutations directly to store
  userRegistryStore.name = name.trim();
  userRegistryStore.email = email.trim().toLowerCase();
  if (currency) userRegistryStore.currency = currency;

  console.log(`[REAL-TIME SYNC ENGINE] Committed identity mutation: ${userRegistryStore.name}`);

  // Return fresh runtime parameters immediately
  res.status(200).json({
    status: 'success',
    message: 'Global state parameters mutated and synchronized securely.',
    data: userRegistryStore
  });
});

module.exports = router;