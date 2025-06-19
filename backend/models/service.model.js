const db = require('../config/db');

// Get all services (optional: only active)
exports.getAllServices = async (includeInactive = false) => {
  const query = includeInactive ? 'SELECT * FROM services' : 'SELECT * FROM services WHERE is_active = TRUE';
  const [rows] = await db.query(query);
  return rows;
};

// Get a service by ID
exports.getServiceById = async (id) => {
  const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
};

// Create new service
exports.createService = async (name) => {
  const [result] = await db.query('INSERT INTO services (name) VALUES (?)', [name]);
  return result.insertId;
};

// Update service name
exports.updateService = async (id, newName) => {
  const [result] = await db.query(
    'UPDATE services SET name = ? WHERE id = ?',
    [newName, id]
  );
  return result.affectedRows > 0;
};


// Soft delete (set is_active = FALSE)
exports.disableService = async (id) => {
  const [result] = await db.query('UPDATE services SET is_active = FALSE WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Reactivate service (set is_active = TRUE)
exports.enableService = async (id) => {
  const [result] = await db.query('UPDATE services SET is_active = TRUE WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Delete permanently (optional, not recommended)
exports.deleteServiceHard = async (id) => {
  const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);
  return result.affectedRows > 0;
};
