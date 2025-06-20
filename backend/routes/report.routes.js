const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, reportController.createDailyReport);
// router.get('/:date', verifyToken, reportController.getDailyReport);
// router.get('/', reportController.getAllReports);

module.exports = router;
