const db = require('../config/db');

// Find or create report_id for the date
exports.findOrCreateReport = async (userId, reportDate) => {
  const [rows] = await db.query(
    'SELECT * FROM daily_reports WHERE report_date = ?',
    [reportDate]
  );

  if (rows.length > 0) return rows[0];

  const [result] = await db.query(
    'INSERT INTO daily_reports (user_id, report_date) VALUES (?, ?)',
    [userId, reportDate]
  );

  return { id: result.insertId };
};

// Insert Expense entries
exports.insertExpenseEntries = async (reportId, entries) => {
  for (const entry of entries) {
    await db.query(
      'INSERT INTO expense_entries (report_id, name, amount) VALUES (?, ?, ?)',
      [reportId, entry.name, entry.amount]
    );
  }
};

// Sum and update total Expense in daily_reports
exports.updateTotalExpense = async (reportId) => {
  const [rows] = await db.query(
    'SELECT SUM(amount) AS total FROM expense_entries WHERE report_id = ?',
    [reportId]
  );
  const total = rows[0].total || 0;

  await db.query(
    'UPDATE daily_reports SET expense = ? WHERE id = ?',
    [total, reportId]
  );

  return total;
};

exports.updateTotalSum = async (reportId) => {
    const [rows] = await db.query(
        'SELECT advance, expense, udhar, total_service FROM daily_reports WHERE id = ?',
        [reportId]
    );

    if (rows.length === 0) throw new Error('Report not found');

    const advance = parseFloat(rows[0].advance) || 0;
    const udhar = parseFloat(rows[0].udhar) || 0;
    const expense = parseFloat(rows[0].expense) || 0;
    const total_service = parseFloat(rows[0].total_service) || 0;

    const totalSum = total_service + udhar + expense - advance;


    await db.query(
        'UPDATE daily_reports SET total_sum = ? WHERE id = ?',
        [totalSum, reportId]
    );

  return totalSum;
};


exports.deleteExpenseEntries = async (reportId) => {
  await db.query('DELETE FROM expense_entries WHERE report_id = ?', [reportId]);
};