const Expense = require('../models/expense.model');

exports.saveExpenseEntries = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role; // assume this is available from verifyToken
  const { report_date, entries } = req.body;

  // Step 1: Validate payload
  if (!report_date || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  // Step 2: Validate date logic
  const today = new Date().toISOString().split('T')[0];

  if (report_date > today) {
    return res.status(400).json({ error: 'Cannot add expenses for a future date' });
  }

  if (userRole !== 'admin' && report_date !== today) {
    return res.status(403).json({ error: 'Only admin can edit past reports' });
  }

  // Step 3: Validate entries
  for (const entry of entries) {
    if (!entry.name || typeof entry.amount !== 'number' || entry.amount < 0) {
      return res.status(400).json({
        error: 'Each entry must have a valid name and a non-negative amount'
      });
    }
  }

  try {
    // Step 4: Get or create daily report
    const report = await Expense.findOrCreateReport(userId, report_date);

    // Step 5: Delete previous entries
    await Expense.deleteExpenseEntries(report.id);

    // Step 6: Insert new expense entries
    await Expense.insertExpenseEntries(report.id, entries);

    // Step 7: Update total expense & report sum
    const total = await Expense.updateTotalExpense(report.id);
    const total_sum = await Expense.updateTotalSum(report.id);

    return res.status(201).json({
      message: 'Expense entries saved successfully',
      report_id: report.id,
      total_expense: total,
      total_sum: total_sum,
    });

  } catch (err) {
    console.error('Expense Save Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




exports.getExpenseEntries = async (req, res) => {
  const { reportId } = req.params;

  if (!reportId) {
    return res.status(400).json({ error: 'Missing report ID' });
  }

  try {
    const entries = await Expense.getExpenseEntriesByReportId(reportId);

    return res.status(200).json({
      report_id: reportId,
      entries: entries || [],
    });
  } catch (error) {
    console.error('Error fetching expense entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};