const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { verifyAdmin } = require('../middleware/auth.middleware');

router.get('/', verifyAdmin, serviceController.getServices);
router.post('/', verifyAdmin, serviceController.createService);
router.put('/:id', verifyAdmin, serviceController.updateService);

router.put('/:id/disable', verifyAdmin, serviceController.disableService);
router.put('/:id/enable', verifyAdmin, serviceController.enableService);

module.exports = router;