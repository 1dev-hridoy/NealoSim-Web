const User = require('../models/User');
const chalk = require('chalk');

module.exports = async (req, res, next) => {
  const uid = req.body.uid || req.headers['x-user-uid'];
  if (!uid) {
    console.log(chalk.red('❌ Auth Error: No UID provided'));
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      console.log(chalk.red(`❌ Auth Error: User not found for UID ${uid}`));
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(chalk.red(`❌ Auth Error: ${error.message}`));
    res.status(500).json({ error: 'Server error during authentication' });
  }
};