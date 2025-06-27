const Udhar = require('../models/udhar.model');

exports.saveUdharEntries = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role; // assume available from auth middleware
  const { report_date, entries } = req.body;

  // Step 1: Basic payload validation
  if (!report_date || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'Invalid or missing data' });
  }

  // Step 2: Date validations
  const today = new Date().toISOString().split('T')[0];

  if (report_date > today) {
    return res.status(400).json({ error: 'Cannot add Udhar for a future date' });
  }

  if (userRole !== 'admin' && report_date !== today) {
    return res.status(403).json({ error: 'Only admin can edit past reports' });
  }

  // Step 3: Entry validation
  for (const entry of entries) {
    if (!entry.name || typeof entry.amount !== 'number' || entry.amount < 0) {
      return res.status(400).json({
        error: 'Each entry must include a valid name and a non-negative amount',
      });
    }
  }

  try {
    // Step 4: Get or create daily report
    const report = await Udhar.findOrCreateReport(userId, report_date);

    // Step 5: Delete existing Udhar entries
    await Udhar.deleteUdharEntries(report.id);

    // Step 6: Insert new entries
    await Udhar.insertUdharEntries(report.id, entries);

    // Step 7: Update total udhar and report total
    const total = await Udhar.updateTotalUdhar(report.id);
    const total_sum = await Udhar.updateTotalSum(report.id);

    return res.status(201).json({
      message: 'Udhar entries saved successfully',
      report_id: report.id,
      total_udhar: total,
      total_sum: total_sum,
    });

  } catch (err) {
    console.error('Udhar Save Error:', err);
    res.status(500).json({ error: 'Something went wrong while saving Udhar entries' });
  }
};




exports.getUdharEntries = async (req, res) => {
  const { reportId } = req.params;

  if (!reportId) {
    return res.status(400).json({ error: 'Missing report ID' });
  }

  try {
    const entries = await Udhar.getUdharEntriesByReportId(reportId);

    return res.status(200).json({
      report_id: reportId,
      entries: entries || [],
    });
  } catch (error) {
    console.error('Error fetching udhar entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};