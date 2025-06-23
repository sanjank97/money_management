const db = require('../config/db');

// Check if report exists
exports.findReportByUserAndDate = async (userId, reportDate) => {
  const [rows] = await db.query(
    'SELECT * FROM daily_reports WHERE user_id = ? AND report_date = ?',
    [userId, reportDate]
  );
  return rows[0] || null;
};

// Insert daily report
exports.createReport = async (userId, reportDate, advance, udhar, expense, totalService, totalSum) => {
  const [result] = await db.query(
    `INSERT INTO daily_reports 
    (user_id, report_date, advance, udhar, expense, total_service, total_sum) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, reportDate, advance, udhar, expense, totalService, totalSum]
  );
  return result.insertId;
};

// Insert service balances
exports.insertServiceBalances = async (reportId, services) => {
  for (const svc of services) {
    await db.query(
      `INSERT INTO service_balances (report_id, service_id, amount)
       VALUES (?, ?, ?)`,
      [reportId, svc.service_id, svc.amount]
    );
  }
};


exports.findReportByUserAndDate = async (userId, date) => {
  const [rows] = await db.query(
    'SELECT * FROM daily_reports WHERE report_date = ?',
    [date]
  );
  return rows.length > 0 ? rows[0] : null;
};

exports.getServiceBalances = async (reportId) => {
  const [rows] = await db.query(
    `SELECT sb.service_id, s.name AS service_name, sb.amount
     FROM service_balances sb
     JOIN services s ON sb.service_id = s.id
     WHERE sb.report_id = ?`,
    [reportId]
  );
  return rows;
};
