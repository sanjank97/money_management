const express = require('express');
const router = express.Router();
const advanceController = require('../controllers/advance.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, advanceController.saveAdvanceEntries);

module.exports = router;
