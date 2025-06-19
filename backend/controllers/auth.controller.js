
const { generateToken } = require('../config/jwt.config');
const { authenticateUserByEmail } = require('../models/user.model');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authenticateUserByEmail(email, password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};