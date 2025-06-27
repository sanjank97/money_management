const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, expenseController.saveExpenseEntries);
router.get('/:reportId', verifyToken, expenseController.getExpenseEntries);

module.exports = router;