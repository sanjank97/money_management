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

// Insert advance entries
exports.insertUdharEntries = async (reportId, entries) => {
  for (const entry of entries) {
    await db.query(
      'INSERT INTO udhar_entries (report_id, name, amount) VALUES (?, ?, ?)',
      [reportId, entry.name, entry.amount]
    );
  }
};

// Sum and update total advance in daily_reports
exports.updateTotalUdhar = async (reportId) => {
  const [rows] = await db.query(
    'SELECT SUM(amount) AS total FROM udhar_entries WHERE report_id = ?',
    [reportId]
  );
  const total = rows[0].total || 0;

  await db.query(
    'UPDATE daily_reports SET udhar = ? WHERE id = ?',
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


exports.deleteUdharEntries = async (reportId) => {
  await db.query('DELETE FROM udhar_entries WHERE report_id = ?', [reportId]);
};


exports.getUdharEntriesByReportId = async (reportId) => {
  const [rows] = await db.query(
    'SELECT id, name, amount FROM udhar_entries WHERE report_id = ?',
    [reportId]
  );
  return rows;
};