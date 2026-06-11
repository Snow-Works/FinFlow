/* ============================================
   FINLY — routes/budgets.js
   DecodeLabs Project 2
   Endpoints:
     GET  /api/budgets         → all budgets
     GET  /api/budgets/:id     → single budget
     POST /api/budgets         → create budget
     PUT  /api/budgets/:id     → update budget
   ============================================ */

const express = require('express');
const router  = express.Router();

/* ─────────────────────────────────────────
   IN-MEMORY DATA STORE
   (No database yet — Project 3 will add one)
   Simulates the dashboard data from our hero
───────────────────────────────────────── */
let budgets = [
  {
    id:          1,
    category:    'Housing',
    allocated:   1500,
    spent:       1080,
    currency:    'USD',
    color:       '#A5856E',
    createdAt:   new Date('2026-06-01').toISOString(),
  },
  {
    id:          2,
    category:    'Food',
    allocated:   600,
    spent:       270,
    currency:    'USD',
    color:       '#c4a48f',
    createdAt:   new Date('2026-06-01').toISOString(),
  },
  {
    id:          3,
    category:    'Transport',
    allocated:   300,
    spent:       90,
    currency:    'USD',
    color:       '#7abfcf',
    createdAt:   new Date('2026-06-01').toISOString(),
  },
  {
    id:          4,
    category:    'Savings',
    allocated:   2000,
    spent:       1200,
    currency:    'USD',
    color:       '#7dba9e',
    createdAt:   new Date('2026-06-01').toISOString(),
  },
];

// Auto-increment ID counter
let nextId = 5;

/* ─────────────────────────────────────────
   VALIDATION HELPER
   Syntactic + Semantic checks on budget data
   "Never trust the client" — DecodeLabs P2
───────────────────────────────────────── */
function validateBudget(data) {
  const errors = [];

  // Syntactic: are required fields present?
  if (!data.category || typeof data.category !== 'string') {
    errors.push('category is required and must be a string');
  }
  if (data.category && data.category.trim().length < 2) {
    errors.push('category must be at least 2 characters');
  }
  if (data.allocated === undefined || data.allocated === null) {
    errors.push('allocated amount is required');
  }

  // Semantic: are the values logically valid?
  if (data.allocated !== undefined && (isNaN(data.allocated) || Number(data.allocated) <= 0)) {
    errors.push('allocated must be a positive number');
  }
  if (data.spent !== undefined && (isNaN(data.spent) || Number(data.spent) < 0)) {
    errors.push('spent must be a non-negative number');
  }
  if (data.spent !== undefined && data.allocated !== undefined) {
    if (Number(data.spent) > Number(data.allocated)) {
      errors.push('spent cannot exceed allocated amount');
    }
  }

  return errors;
}

/* ─────────────────────────────────────────
   GET /api/budgets
   Returns all budget categories with
   computed percentage and status
───────────────────────────────────────── */
router.get('/', (req, res) => {
  // Add computed fields to each budget
  const enriched = budgets.map(b => ({
    ...b,
    percentage: Math.round((b.spent / b.allocated) * 100),
    remaining:  b.allocated - b.spent,
    status:     b.spent >= b.allocated
                  ? 'over_budget'
                  : b.spent / b.allocated >= 0.8
                  ? 'warning'
                  : 'on_track',
  }));

  // Summary totals
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent     = budgets.reduce((sum, b) => sum + b.spent, 0);

  res.status(200).json({
    status: 'success',
    count:  enriched.length,
    summary: {
      totalAllocated,
      totalSpent,
      totalRemaining: totalAllocated - totalSpent,
      overallPercentage: Math.round((totalSpent / totalAllocated) * 100),
    },
    data: enriched,
  });
});

/* ─────────────────────────────────────────
   GET /api/budgets/:id
   Returns a single budget by ID
───────────────────────────────────────── */
router.get('/:id', (req, res) => {
  const id     = parseInt(req.params.id);
  const budget = budgets.find(b => b.id === id);

  if (!budget) {
    return res.status(404).json({
      status:  'error',
      code:    404,
      message: `Budget with id ${id} not found`,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      ...budget,
      percentage: Math.round((budget.spent / budget.allocated) * 100),
      remaining:  budget.allocated - budget.spent,
      status:     budget.spent >= budget.allocated ? 'over_budget'
                : budget.spent / budget.allocated >= 0.8 ? 'warning'
                : 'on_track',
    },
  });
});

/* ─────────────────────────────────────────
   POST /api/budgets
   Create a new budget category
   Body: { category, allocated, spent?, currency? }
───────────────────────────────────────── */
router.post('/', (req, res) => {
  const { category, allocated, spent = 0, currency = 'USD', color = '#A5856E' } = req.body;

  // Run validation
  const errors = validateBudget({ category, allocated, spent });

  if (errors.length > 0) {
    return res.status(400).json({
      status:  'error',
      code:    400,
      message: 'Validation failed',
      errors,
    });
  }

  // Check for duplicate category (semantic validation)
  const duplicate = budgets.find(
    b => b.category.toLowerCase() === category.trim().toLowerCase()
  );

  if (duplicate) {
    return res.status(400).json({
      status:  'error',
      code:    400,
      message: `Budget category "${category}" already exists`,
    });
  }

  // Create new budget object
  const newBudget = {
    id:        nextId++,
    category:  category.trim(),
    allocated: Number(allocated),
    spent:     Number(spent),
    currency,
    color,
    createdAt: new Date().toISOString(),
  };

  budgets.push(newBudget);

  res.status(201).json({
    status:  'success',
    message: `Budget "${newBudget.category}" created successfully`,
    data:    newBudget,
  });
});

/* ─────────────────────────────────────────
   PUT /api/budgets/:id
   Update an existing budget entry
───────────────────────────────────────── */
router.put('/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const index = budgets.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({
      status:  'error',
      code:    404,
      message: `Budget with id ${id} not found`,
    });
  }

  const { category, allocated, spent, currency, color } = req.body;

  // Validate only what was sent
  const toValidate = {
    category:  category  ?? budgets[index].category,
    allocated: allocated ?? budgets[index].allocated,
    spent:     spent     ?? budgets[index].spent,
  };

  const errors = validateBudget(toValidate);
  if (errors.length > 0) {
    return res.status(400).json({
      status:  'error',
      code:    400,
      message: 'Validation failed',
      errors,
    });
  }

  // Merge updates
  budgets[index] = {
    ...budgets[index],
    category:  category  ? category.trim()    : budgets[index].category,
    allocated: allocated ? Number(allocated)   : budgets[index].allocated,
    spent:     spent     !== undefined ? Number(spent) : budgets[index].spent,
    currency:  currency  ?? budgets[index].currency,
    color:     color     ?? budgets[index].color,
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    status:  'success',
    message: 'Budget updated successfully',
    data:    budgets[index],
  });
});

module.exports = router;