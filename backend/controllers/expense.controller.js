const Expense = require('../models/expense.model');

exports.saveExpenseEntries = async (req, res) => {
  const userId = req.user.id; // single user system
  const { report_date, entries } = req.body;

  if (!report_date || !entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    // Step 1: Get or create report
    const report = await Expense.findOrCreateReport(userId, report_date);

    // Step 2: Delete existing Expense entries for this report
    await Expense.deleteExpenseEntries(report.id);

    // Step 3: Insert all entries
    await Expense.insertExpenseEntries(report.id, entries);

    // Step 4: Update total Expense
    const total = await Expense.updateTotalExpense(report.id);

    // 5. update total_sum field in daily_report 
    const total_sum = await Expense.updateTotalSum(report.id);

    return res.status(201).json({
      message: 'Expense entries saved successfully',
      report_id: report.id,
      total_Expense: total,
      total_sum: total_sum,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};



exports.getAdvanceEntries = async (req, res) => {
  const { reportId } = req.params;

  if (!reportId) {
    return res.status(400).json({ error: 'Missing report ID' });
  }

  try {
    const entries = await Advance.getAdvanceEntriesByReportId(reportId);

    return res.status(200).json({
      report_id: reportId,
      entries: entries || [],
    });
  } catch (error) {
    console.error('Error fetching advance entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};