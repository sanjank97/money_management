const Report = require('../models/report.model');

exports.createDailyReport = async (req, res) => {
  const userId = req.user.id; // Only 1 user in your system
  const { report_date, services, advance, udhar, expense } = req.body;

  try {
    // Step 1: Prevent future date
    const today = new Date().toISOString().split('T')[0];
    if (report_date > today) {
      return res.status(400).json({ error: 'Cannot create report for future date' });
    }

    // Step 2: Check if report already exists
    const existing = await Report.findReportByUserAndDate(userId, report_date);
    if (existing) {
      return res.status(400).json({ error: 'Report already exists for this date' });
    }

    // Step 3: Calculate totals
    const totalService = services.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const totalSum = totalService + udhar + expense - advance;

    // Step 4: Insert daily report
    const reportId = await Report.createReport(
      userId, report_date, advance, udhar, expense, totalService, totalSum
    );

    // Step 5: Insert service balances
    await Report.insertServiceBalances(reportId, services);

    return res.status(201).json({
      message: 'Daily report submitted successfully',
      report_id: reportId,
      total_service: totalService,
      total_sum: totalSum
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong while creating report' });
  }
};
