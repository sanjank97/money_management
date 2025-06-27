const express = require('express');
const router = express.Router();
const udharController = require('../controllers/udhar.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, udharController.saveUdharEntries);
router.get('/:reportId', verifyToken, udharController.getUdharEntries);

module.exports = router;