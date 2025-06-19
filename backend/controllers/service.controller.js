const Service = require('../models/service.model');

// GET /api/services?all=true
exports.getServices = async (req, res) => {
  const includeInactive = req.query.all === 'true';
  try {
    const services = await Service.getAllServices(includeInactive);
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// POST /api/services { name }
exports.createService = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Service name is required' });

  try {

    const serviceId = await Service.createService(name.toUpperCase());
    res.status(201).json({ id: serviceId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Service name already exists' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Failed to create service' });
    }
  }
};


// PUT /api/services/:id { name }
exports.updateService = async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'New service name is required' });

  try {
    const updated = await Service.updateService(id, name.toUpperCase());
    if (updated) {
      res.json({ message: 'Service updated successfully' });
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Service name already exists' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Failed to update service' });
    }
  }
};

// PUT /api/service/:id/disable
exports.disableService = async (req, res) => {
  const id = req.params.id;
  try {
    const success = await Service.disableService(id);
    if (success) {
      res.json({ message: 'Service disabled' });
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to disable service' });
  }
};

// PUT /api/services/:id/enable
exports.enableService = async (req, res) => {
  const id = req.params.id;
  try {
    const success = await Service.enableService(id);
    if (success) {
      res.json({ message: 'Service enabled' });
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to enable service' });
  }
};
