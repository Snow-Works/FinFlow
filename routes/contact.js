/* ============================================
   FINLY — routes/contact.js
   DecodeLabs Project 2
   Endpoints:
     POST /api/contact     → waitlist / CTA form
     GET  /api/contact     → list all submissions
   ============================================ */

const express = require('express');
const router  = express.Router();

/* ─────────────────────────────────────────
   IN-MEMORY STORE
───────────────────────────────────────── */
let submissions = [];
let nextId = 1;

/* ─────────────────────────────────────────
   VALIDATION HELPER
───────────────────────────────────────── */
// Simple email regex check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(data) {
  const errors = [];

  // Name
  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required');
  }
  if (data.name && data.name.trim().length < 2) {
    errors.push('name must be at least 2 characters');
  }

  // Email
  if (!data.email || typeof data.email !== 'string') {
    errors.push('email is required');
  }
  if (data.email && !EMAIL_REGEX.test(data.email.trim())) {
    errors.push('email must be a valid email address');
  }

  // Plan (optional but must be valid if provided)
  const validPlans = ['free', 'pro', 'team'];
  if (data.plan && !validPlans.includes(data.plan.toLowerCase())) {
    errors.push(`plan must be one of: ${validPlans.join(', ')}`);
  }

  return errors;
}

/* ─────────────────────────────────────────
   POST /api/contact
   Handles "Get Started" CTA from landing page
   Body: { name, email, plan?, message? }
───────────────────────────────────────── */
router.post('/', (req, res) => {
  const {
    name,
    email,
    plan    = 'free',
    message = '',
  } = req.body;

  // Validate input
  const errors = validateContact({ name, email, plan });

  if (errors.length > 0) {
    return res.status(400).json({
      status:  'error',
      code:    400,
      message: 'Validation failed',
      errors,
    });
  }

  // Check for duplicate email (semantic validation)
  const existing = submissions.find(
    s => s.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (existing) {
    return res.status(400).json({
      status:  'error',
      code:    400,
      message: `${email} is already on the waitlist`,
    });
  }

  const newSubmission = {
    id:        nextId++,
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    plan:      plan.toLowerCase(),
    message:   message.trim(),
    joinedAt:  new Date().toISOString(),
  };

  submissions.push(newSubmission);

  console.log(`[WAITLIST] New signup: ${newSubmission.name} (${newSubmission.email}) — ${newSubmission.plan} plan`);

  res.status(201).json({
    status:  'success',
    message: `Welcome to Finly, ${newSubmission.name}! You're on the waitlist.`,
    data: {
      id:       newSubmission.id,
      name:     newSubmission.name,
      email:    newSubmission.email,
      plan:     newSubmission.plan,
      joinedAt: newSubmission.joinedAt,
    },
  });
});

/* ─────────────────────────────────────────
   GET /api/contact
   View all waitlist submissions
───────────────────────────────────────── */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    count:  submissions.length,
    data:   submissions,
  });
});

module.exports = router;