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


exports.getDailyReport = async (req, res) => {
  const userId = req.user.id; // From verifyToken middleware
  const reportDate = req.params.date;

  try {
    // Step 1: Fetch the main report
    const report = await Report.findReportByUserAndDate(userId, reportDate);
    if (!report) {
      return res.status(404).json({ error: 'Report not found for this date' });
    }

    // Step 2: Fetch all service balances for this report
    const services = await Report.getServiceBalances(report.id);

    // Step 3: Return full data
    return res.status(200).json({
      report_id: report.id,
      report_date: report.report_date,
      advance: report.advance,
      udhar: report.udhar,
      expense: report.expense,
      total_service: report.total_service,
      total_sum: report.total_sum,
      services: services
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error retrieving daily report' });
  }
};