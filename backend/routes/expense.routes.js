const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, expenseController.saveExpenseEntries);

module.exports = router;