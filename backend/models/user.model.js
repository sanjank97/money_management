const db = require('../config/db');

// Get all users
exports.getAllUsers = async () => {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
};

// Get user by email
exports.getUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows.length > 0 ? rows[0] : null;
};

// Authenticate (compare plain text passwords)
exports.authenticateUserByEmail = async (email, password) => {
  const user = await exports.getUserByEmail(email);
  if (!user) return null;

  return user.password === password ? user : null;
};

// Create new user (plain text password)
// exports.createUser = async (name, email, password) => {
//   const [result] = await db.query(
//     'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
//     [name, email, password]
//   );
//   return result.insertId;
// };
