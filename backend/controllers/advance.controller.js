
const Advance = require('../models/advance.model');

exports.saveAdvanceEntries = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { report_date, entries } = req.body;

  if (!report_date || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'Invalid or missing data' });
  }

  const today = new Date().toISOString().split('T')[0];

  // 🚫 Future date restriction
  if (report_date > today) {
    return res.status(400).json({ error: 'Cannot add entries for future date' });
  }

  // 🚫 Non-admins can't backdate
  if (userRole !== 'admin' && report_date !== today) {
    return res.status(403).json({ error: 'You can only modify today\'s report' });
  }

  // ✅ Entry-level validation
  for (const entry of entries) {
    if (!entry.name || typeof entry.amount !== 'number' || entry.amount < 0) {
      return res.status(400).json({ error: 'Each entry must have a valid name and positive amount' });
    }
  }

  try {
    const report = await Advance.findOrCreateReport(userId, report_date);

    await Advance.deleteAdvanceEntries(report.id);
    await Advance.insertAdvanceEntries(report.id, entries);

    const total = await Advance.updateTotalAdvance(report.id);
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