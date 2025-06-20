const Udhar = require('../models/udhar.model');

exports.saveUdharEntries = async (req, res) => {
  const userId = req.user.id; // single user system
  const { report_date, entries } = req.body;

  if (!report_date || !entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    // Step 1: Get or create report
    const report = await Udhar.findOrCreateReport(userId, report_date);

    // Step 2: Delete existing Udhar entries for this report
    await Udhar.deleteUdharEntries(report.id);

    // Step 3: Insert all entries
    await Udhar.insertUdharEntries(report.id, entries);

    // Step 4: Update total Udhar
    const total = await Udhar.updateTotalUdhar(report.id);

// 5. update total_sum field in daily_report 
    const total_sum = await Udhar.updateTotalSum(report.id);

    return res.status(201).json({
      message: 'Udhar entries save successfully',
      report_id: report.id,
      total_Udhar: total,
      total_sum: total_sum,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};



