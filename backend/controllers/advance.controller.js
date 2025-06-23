const Advance = require('../models/advance.model');

exports.saveAdvanceEntries = async (req, res) => {
  const userId = req.user.id; // default 1 for single user
  const { report_date, entries } = req.body;

  if (!report_date || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'Invalid or missing data' });
  }

  try {
    // 1. Find or create daily report
    const report = await Advance.findOrCreateReport(userId, report_date);

    // 2. Clear previous entries (if exist)
    await Advance.deleteAdvanceEntries(report.id);

    // 3. Insert new advance entries
    await Advance.insertAdvanceEntries(report.id, entries);

    // 4. Update total advance in daily report
    const total = await Advance.updateTotalAdvance(report.id);

    // 5. update total_sum field in daily_report 
    const total_sum = await Advance.updateTotalSum(report.id);


    return res.status(200).json({
      message: 'Advance entries saved successfully',
      report_id: report.id,
      total_advance: total,
      total_sum: total_sum,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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