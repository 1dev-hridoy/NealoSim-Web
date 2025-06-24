const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const chalk = require('chalk');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    console.log(chalk.red(`❌ Signup Failed: Missing fields (name: ${name}, email: ${email})`));
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    console.log(chalk.red(`❌ Signup Failed for ${email}: Password too short`));
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(chalk.red(`❌ Signup Failed: Email ${email} already exists`));
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    console.log(chalk.green(`✅ New User Signed Up: ${name} (${email}, UID: ${user.uid})`));
    res.status(201).json({ uid: user.uid, message: 'Signup successful' });
  } catch (error) {
    console.log(chalk.red(`❌ Signup Error for ${email}: ${error.message}`));
    res.status(500).json({ error: 'Server error during signup' });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log(chalk.red(`❌ Signin Failed: Missing fields (email: ${email})`));
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(chalk.red(`❌ Signin Failed: Invalid email ${email}`));
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(chalk.red(`❌ Signin Failed for ${email}: Incorrect password`));
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log(chalk.green(`✅ User Signed In: ${user.name} (${email}, UID: ${user.uid})`));
    res.json({ uid: user.uid, message: 'Signin successful' });
  } catch (error) {
    console.log(chalk.red(`❌ Signin Error for ${email}: ${error.message}`));
    res.status(500).json({ error: 'Server error during signin' });
  }
});

module.exports = router;