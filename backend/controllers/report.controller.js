const Report = require('../models/report.model');
exports.createOrUpdateDailyReport = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role; // assuming you store this in token
  const { report_date, services, advance, udhar, expense } = req.body;

  try {
    const today = new Date().toISOString().split('T')[0];

    // 🛑 Prevent future date for everyone
    if (report_date > today) {
      return res.status(400).json({ error: 'Cannot create report for future date' });
    }

    // 🛑 Prevent backdated reports if not admin
    if (userRole !== 'admin' && report_date !== today) {
      return res.status(403).json({ error: 'You are not allowed to create or update backdated reports' });
    }

    // ✅ Calculate totals
    const totalService = services.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const totalSum = totalService + udhar + expense - advance;

    // ✅ Check if report exists
    const existing = await Report.findReportByUserAndDate(userId, report_date);

    let reportId;

    if (existing) {
      // ✅ Update report
      reportId = existing.id;

      await Report.updateReport(
        reportId,
        advance,
        udhar,
        expense,
        totalService,
        totalSum
      );

      await Report.deleteServiceBalances(reportId);
      await Report.insertServiceBalances(reportId, services);

    } else {
      // ✅ Create new report
      reportId = await Report.createReport(
        userId,
        report_date,
        advance,
        udhar,
        expense,
        totalService,
        totalSum
      );

      await Report.insertServiceBalances(reportId, services);
    }

    return res.status(200).json({
      message: existing ? 'Report updated successfully' : 'Report created successfully',
      report_id: reportId,
      total_service: totalService,
      total_sum: totalSum,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong while saving the report' });
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