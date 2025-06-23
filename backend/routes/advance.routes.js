const express = require('express');
const router = express.Router();
const advanceController = require('../controllers/advance.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, advanceController.saveAdvanceEntries);
router.get('/:reportId', verifyToken, advanceController.getAdvanceEntries);

module.exports = router;
