/* ============================================
   FINLY — routes/transactions.js
   DecodeLabs Project 2
   Endpoints:
     GET  /api/transactions         → all transactions
     GET  /api/transactions/:id     → single transaction
     POST /api/transactions         → log new transaction
   ============================================ */

const express = require('express');
const router  = express.Router();

/* ─────────────────────────────────────────
   IN-MEMORY DATA STORE
───────────────────────────────────────── */
let transactions = [
  {
    id:          1,
    description: 'Monthly Rent',
    amount:      1080,
    type:        'expense',
    category:    'Housing',
    date:        '2026-06-01',
    createdAt:   new Date('2026-06-01').toISOString(),
  },
  {
    id:          2,
    description: 'Grocery Shopping',
    amount:      85.50,
    type:        'expense',
    category:    'Food',
    date:        '2026-06-02',
    createdAt:   new Date('2026-06-02').toISOString(),
  },
  {
    id:          3,
    description: 'Monthly Salary',
    amount:      5000,
    type:        'income',
    category:    'Income',
    date:        '2026-06-01',
    createdAt:   new Date('2026-06-01').toISOString(),
  },
  {
    id:          4,
    description: 'Uber Rides',
    amount:      34.20,
    type:        'expense',
    category:    'Transport',
    date:        '2026-06-03',
    createdAt:   new Date('2026-06-03').toISOString(),
  },
  {
    id:          5,
    description: 'Savings Transfer',
    amount:      1200,
    type:        'expense',
    category:    'Savings',
    date:        '2026-06-01',
    createdAt:   new Date('2026-06-01').toISOString(),
  },
];

let nextId = 6;

/* ─────────────────────────────────────────
   VALIDATION HELPER
───────────────────────────────────────── */
const VALID_TYPES = ['income', 'expense'];

function validateTransaction(data) {
  const errors = [];

  if (!data.description || typeof data.description !== 'string') {
    errors.push('description is required and must be a string');
  }
  if (data.description && data.description.trim().length < 2) {
    errors.push('description must be at least 2 characters');
  }
  if (data.amount === undefined || data.amount === null) {
    errors.push('amount is required');
  }
  if (data.amount !== undefined && (isNaN(data.amount) || Number(data.amount) <= 0)) {
    errors.push('amount must be a positive number');
  }
  if (!data.type) {
    errors.push('type is required');
  }
  if (data.type && !VALID_TYPES.includes(data.type)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }
  if (!data.category || typeof data.category !== 'string') {
    errors.push('category is required');
  }
  if (data.date && isNaN(Date.parse(data.date))) {
    errors.push('date must be a valid date string (YYYY-MM-DD)');
  }

  return errors;
}

/* ─────────────────────────────────────────
   GET /api/transactions
   Optional query params:
     ?type=income|expense
     ?category=Housing
     ?limit=10
───────────────────────────────────────── */
router.get('/', (req, res) => {
  let result = [...transactions];

  // Filter by type
  if (req.query.type) {
    if (!VALID_TYPES.includes(req.query.type)) {
      return res.status(400).json({
        status:  'error',
        code:    400,
        message: `Invalid type filter. Must be: ${VALID_TYPES.join(', ')}`,
      });
    }
    result = result.filter(t => t.type === req.query.type);
  }

  // Filter by category
  if (req.query.category) {
    result = result.filter(
      t => t.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  // Limit results
  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({
        status:  'error',
        code:    400,
        message: 'limit must be a positive integer',
      });
    }
    result = result.slice(0, limit);
  }

  // Compute summary totals
  const totalIncome  = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  res.status(200).json({
    status: 'success',
    count:  result.length,
    summary: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    },
    data: result,
  });
});

/* ─────────────────────────────────────────
   GET /api/transactions/:id
───────────────────────────────────────── */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const transaction = transactions.find(t => t.id === id);

  if (!transaction) {
    return res.status(404).json({
      status:  'error',
      code:    404,
      message: `Transaction with id ${id} not found`,
    });
  }

  res.status(200).json({
    status: 'success',
    data:   transaction,
  });
});

/* ─────────────────────────────────────────
   POST /api/transactions
   Log a new transaction
   Body: { description, amount, type, category, date? }
───────────────────────────────────────── */
router.post('/', (req, res) => {
  const {
    description,
    amount,
    type,
    category,
    date = new Date().toISOString().split('T')[0],
  } = req.body;

  const errors = validateTransaction({ description, amount, type, category, date });

  if (errors.length > 0) {
    return res.status(400).json({
      status:  'error',
      code:    400,
      message: 'Validation failed',
      errors,
    });
  }

  const newTransaction = {
    id:          nextId++,
    description: description.trim(),
    amount:      Number(amount),
    type,
    category:    category.trim(),
    date,
    createdAt:   new Date().toISOString(),
  };

  transactions.push(newTransaction);

  res.status(201).json({
    status:  'success',
    message: 'Transaction logged successfully',
    data:    newTransaction,
  });
});

module.exports = router;